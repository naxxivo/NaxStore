
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line_1: string
          city: string
          country: string
          created_at: string
          full_name: string
          id: number
          is_default: boolean
          state: string
          user_id: string
          zip_code: string
        }
        Insert: {
          address_line_1: string
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: number
          is_default?: boolean
          state: string
          user_id: string
          zip_code: string
        }
        Update: {
          address_line_1?: string
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: number
          is_default?: boolean
          state?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id: number
          metadata: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id?: number
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          id?: number
          metadata?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      banners: {
        Row: {
          created_at: string
          end_time: string | null
          id: number
          image_url: string | null
          is_active: boolean
          link_url: string | null
          start_time: string
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          start_time?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: number
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          start_time?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          id: number
          product_id: number
          quantity: number
          variant_id: number | null
        }
        Insert: {
          cart_id: string
          id?: number
          product_id: number
          quantity: number
          variant_id?: number | null
        }
        Update: {
          cart_id?: string
          id?: number
          product_id?: number
          quantity?: number
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["cart_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["cart_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          name: string
          parent_id: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          name: string
          parent_id?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          name?: string
          parent_id?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      commissions: {
        Row: {
          amount: number
          commission_rate: number
          created_at: string
          id: number
          order_item_id: number
          seller_id: string
        }
        Insert: {
          amount: number
          commission_rate: number
          created_at?: string
          id?: number
          order_item_id: number
          seller_id: string
        }
        Update: {
          amount?: number
          commission_rate?: number
          created_at?: string
          id?: number
          order_item_id?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_order_item_id_fkey"
            columns: ["order_item_id"]
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          code: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          id: number
          is_active: boolean
          min_order_value: number | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          code: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          id?: number
          is_active?: boolean
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          code?: string
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number
          id?: number
          is_active?: boolean
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: number
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: number
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: number
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          is_read: boolean
          message: string
          metadata: Json | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_read?: boolean
          message: string
          metadata?: Json | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_read?: boolean
          message?: string
          metadata?: Json | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          price: number
          product_id: number | null
          quantity: number
          variant_id: number | null
        }
        Insert: {
          id?: number
          order_id: number
          price: number
          product_id?: number | null
          quantity: number
          variant_id?: number | null
        }
        Update: {
          id?: number
          order_id?: number
          price?: number
          product_id?: number | null
          quantity?: number
          variant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      order_tracking: {
        Row: {
          id: number
          location: string | null
          order_id: number
          status: string
          timestamp: string
        }
        Insert: {
          id?: number
          location?: string | null
          order_id: number
          status: string
          timestamp?: string
        }
        Update: {
          id?: number
          location?: string | null
          order_id?: number
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          cart_id: string | null
          created_at: string
          id: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          public_id: string
          shipping_address_json: Json
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          tax: number
          total_price: number
          user_id: string
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          id?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          public_id?: string
          shipping_address_json: Json
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          tax?: number
          total_price: number
          user_id: string
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          id?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          public_id?: string
          shipping_address_json?: Json
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          tax?: number
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_cart_id_fkey"
            columns: ["cart_id"]
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      product_variants: {
        Row: {
          id: number
          options: Json | null
          price_modifier: number
          product_id: number
          sku: string | null
          stock: number
        }
        Insert: {
          id?: number
          options?: Json | null
          price_modifier?: number
          product_id: number
          sku?: string | null
          stock?: number
        }
        Update: {
          id?: number
          options?: Json | null
          price_modifier?: number
          product_id?: number
          sku?: string | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: number
          created_at: string
          description: string | null
          id: number
          images: string[] | null
          seller_id: string
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
        }
        Insert: {
          base_price: number
          category_id: number
          created_at?: string
          description?: string | null
          id?: number
          images?: string[] | null
          seller_id: string
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
        }
        Update: {
          base_price?: number
          category_id?: number
          created_at?: string
          description?: string | null
          id?: number
          images?: string[] | null
          seller_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          referral_code: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          referral_code?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: number
          referred_id: string
          referrer_id: string
          reward_given: boolean
          status: Database["public"]["Enums"]["referral_status"]
        }
        Insert: {
          created_at?: string
          id?: number
          referred_id: string
          referrer_id: string
          reward_given?: boolean
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Update: {
          created_at?: string
          id?: number
          referred_id?: string
          referrer_id?: string
          reward_given?: boolean
          status?: Database["public"]["Enums"]["referral_status"]
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reward_points: {
        Row: {
          id: number
          points_balance: number
          tier: Database["public"]["Enums"]["reward_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          points_balance?: number
          tier?: Database["public"]["Enums"]["reward_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          points_balance?: number
          tier?: Database["public"]["Enums"]["reward_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_points_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          images: string[] | null
          product_id: number
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          images?: string[] | null
          product_id: number
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          images?: string[] | null
          product_id?: number
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sellers: {
        Row: {
          business_name: string | null
          commission_rate: number
          id: string
          is_verified: boolean
          tax_id: string | null
        }
        Insert: {
          business_name?: string | null
          commission_rate?: number
          id: string
          is_verified?: boolean
          tax_id?: string | null
        }
        Update: {
          business_name?: string | null
          commission_rate?: number
          id?: string
          is_verified?: boolean
          tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          added_at: string
          id: number
          product_id: number
          wishlist_id: string
        }
        Insert: {
          added_at?: string
          id?: number
          product_id: number
          wishlist_id: string
        }
        Update: {
          added_at?: string
          id?: number
          product_id?: number
          wishlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_wishlist_id_fkey"
            columns: ["wishlist_id"]
            referencedRelation: "wishlists"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_commissions: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      create_order_from_cart: {
        Args: {
          shipping_address_payload: Json
          coupon_discount: number
          coupon_code: string
        }
        Returns: number
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_event: {
        Args: {
          p_event_type: Database["public"]["Enums"]["analytics_event_type"]
          p_metadata: Json
        }
        Returns: undefined
      }
      subscribe_to_newsletter: {
        Args: {
          p_email: string
        }
        Returns: undefined
      }
      validate_coupon: {
        Args: {
          p_code: string
        }
        Returns: Json
      }
      verify_seller: {
        Args: {
          seller_id_to_verify: string
        }
        Returns: undefined
      }
    }
    Enums: {
      analytics_event_type:
        | "page_view"
        | "product_click"
        | "add_to_cart"
        | "purchase"
      cart_status: "active" | "checked_out" | "abandoned"
      coupon_discount_type: "percentage" | "fixed"
      notification_type:
        | "order"
        | "promo"
        | "system"
        | "seller"
        | "wishlist"
      order_status:
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "pending_payment"
      payment_status: "pending" | "paid" | "failed"
      product_status: "draft" | "active" | "archived"
      referral_status: "pending" | "completed"
      reward_tier: "Bronze" | "Silver" | "Gold" | "Platinum"
      user_role: "user" | "admin" | "seller"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
