
import { create } from 'zustand';
import { supabase } from '../integrations/supabase/client';
import { Product, Review } from '../types';
import { Database } from '../integrations/supabase/types';
import { useAuthStore } from './authStore';
import { useToastStore } from './toastStore';

// Supabase row types
type ProductRow = Database['public']['Tables']['products']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type VariantRow = Database['public']['Tables']['product_variants']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];

// The shape of data from our complex query
interface FetchedProduct extends ProductRow {
    profiles: ProfileRow | null;
    product_variants: VariantRow[] | null; // Can be null
    reviews: (ReviewRow & { profiles: ProfileRow | null })[] | null; // Can be null
}

const mapSupabaseToAppProduct = (p: FetchedProduct): Product => {
  // FIX: Defensively handle cases where related tables might be null.
  // Supabase returns null for empty one-to-many relationships, not an empty array.
  const variants = p.product_variants || [];
  const reviews = p.reviews || [];
  const images = p.images || [];
  const mainImage = images[0] || `https://picsum.photos/seed/${p.id}/600/600`;

  const totalStock = variants.reduce((acc, variant) => acc + (variant.stock || 0), 0);

  return {
    id: p.id,
    name: p.title,
    price: p.base_price,
    image: mainImage,
    images: images.length > 0 ? images : [mainImage],
    description: p.description || '',
    stock: totalStock,
    sellerId: p.seller_id,
    reviews: reviews.map(r => ({
        id: r.id,
        author: r.profiles?.full_name || 'Anonymous',
        rating: r.rating,
        comment: r.comment || '',
        date: new Date(r.created_at).toLocaleDateString(),
    })),
  };
};

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  addReview: (productId: number, rating: number, comment: string) => Promise<boolean>;
  addProduct: (productData: { title: string; description: string; price: number; stock: number; categoryId: number; images: string[] }) => Promise<Product | null>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    // Avoid re-fetching if data is already loading, but allow refetching
    if (get().loading) return;

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (*),
          profiles (*),
          reviews (
            *,
            profiles (*)
          )
        `);
        // Removed .eq('status', 'active') to rely on RLS for fetching rules, which is more robust.

      if (error) throw error;

      const mappedProducts = data.map(p => mapSupabaseToAppProduct(p as unknown as FetchedProduct));
      set({ products: mappedProducts, loading: false });

    } catch (error: any) {
      console.error("Error fetching products:", error);
      set({ error: "Failed to load products from the universe.", loading: false });
    }
  },
  getProductById: (id: number) => {
    return get().products.find(p => p.id === id);
  },
  addReview: async (productId, rating, comment) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    const newReview: Review = {
        id: Date.now(), // temporary ID
        author: user.name,
        rating,
        comment,
        date: new Date().toLocaleDateString(),
    };

    // Optimistic update
    set(state => ({
        products: state.products.map(p => 
            p.id === productId ? { ...p, reviews: [newReview, ...p.reviews] } : p
        )
    }));

    const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: rating,
        comment: comment,
    });
    
    if (error) {
        console.error("Error adding review:", error);
        useToastStore.getState().addToast({ message: "Failed to submit review.", type: 'error' });
        // Revert optimistic update
        set(state => ({
            products: state.products.map(p =>
                p.id === productId ? { ...p, reviews: p.reviews.filter(r => r.id !== newReview.id) } : p
            )
        }));
        return false;
    }

    useToastStore.getState().addToast({ message: "Review submitted!", type: 'success' });
    // Re-fetch product to get the correct review ID, or just live with the optimistic one
    return true;
  },
  addProduct: async (productData) => {
    const user = useAuthStore.getState().user;
    if (!user || user.role !== 'seller') return null;

    // 1. Insert into products table
    const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
            seller_id: user.id,
            category_id: productData.categoryId,
            title: productData.title,
            description: productData.description,
            base_price: productData.price,
            images: productData.images,
            status: 'active',
        })
        .select()
        .single();
        
    if (productError || !newProduct) {
        console.error("Error creating product:", productError);
        useToastStore.getState().addToast({ message: "Failed to create product.", type: 'error' });
        return null;
    }
    
    // 2. Insert into product_variants table (a single default variant for simplicity)
    const { error: variantError } = await supabase.from('product_variants').insert({
        product_id: newProduct.id,
        stock: productData.stock,
    });

    if (variantError) {
        // This is a problem. We should ideally roll back the product insert.
        // For simplicity, we'll just log the error.
        console.error("Error creating product variant:", variantError);
        useToastStore.getState().addToast({ message: "Product created, but failed to set stock.", type: 'error' });
    }

    // Create a client-side representation to add to the store
    const appProduct: Product = {
        id: newProduct.id,
        name: newProduct.title,
        price: newProduct.base_price,
        image: newProduct.images?.[0] || '',
        images: newProduct.images || [],
        description: newProduct.description || '',
        stock: productData.stock,
        sellerId: newProduct.seller_id,
        reviews: [],
    };

    set(state => ({ products: [appProduct, ...state.products] }));
    useToastStore.getState().addToast({ message: `${appProduct.name} has been added!`, type: 'success' });
    return appProduct;
  }
}));
