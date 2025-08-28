import { create } from 'zustand';
import { Product } from '../types';
import { useProductStore } from './productStore';

interface ShopperState {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: Product[];
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  toggleShopper: () => void;
  findSuggestions: () => Promise<void>;
}

const shopperPrompt = `
You are a witty and helpful AI personal shopper for 'NaxStore', a modern, space-themed apparel and accessories store.
Your goal is to help users find the perfect products based on their descriptions.
Analyze the user's request and compare it against the provided list of available products.
You must respond ONLY with a JSON object that strictly follows the provided schema.
The 'productIds' array should contain the IDs of the products that are the best match for the user's request.
Return an empty array if no products are a good match.
Do not include any other text, explanations, or introductory phrases in your response.
`;

export const useShopperStore = create<ShopperState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  suggestions: [],
  error: null,
  query: '',
  setQuery: (query) => set({ query }),
  toggleShopper: () => {
    set((state) => ({ isOpen: !state.isOpen, error: null, suggestions: [] }));
  },
  findSuggestions: async () => {
    const { query } = get();
    if (!query.trim()) return;

    set({ isLoading: true, error: null, suggestions: [] });

    try {
      // Get products from the live product store
      let allProducts = useProductStore.getState().products;
      if (allProducts.length === 0) {
        await useProductStore.getState().fetchProducts();
        allProducts = useProductStore.getState().products;
      }
      
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const productCatalog = allProducts.map(({ id, name, description }) => ({ id, name, description }));
      
      const fullPrompt = `${shopperPrompt}\nAvailable products:\n${JSON.stringify(productCatalog)}\n\nUser's request: "${query}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productIds: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
              },
            },
            required: ['productIds'],
          },
        },
      });
      
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText) as { productIds: number[] };
      const suggestedIds = result.productIds || [];
      
      const suggestedProducts = allProducts.filter(p => suggestedIds.includes(p.id));
      set({ suggestions: suggestedProducts });

    } catch (err) {
      console.error("Error fetching suggestions:", err);
      set({ error: "Sorry, I had trouble finding suggestions. Please try again." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
