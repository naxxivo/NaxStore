
import { Database, Json } from "./integrations/supabase/types";

export interface Review {
  id: number;
  author: string;
  rating: number; // out of 5
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string; // Main image
  images: string[]; // Gallery images
  description: string;
  reviews: Review[];
  stock: number;
  sellerId: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type WishlistItem = Product;

export type OrderStatus = Database['public']['Enums']['order_status'];

export interface TrackingEvent {
    status: string;
    location: string;
    timestamp: string;
}

// This type represents a fully populated order for UI display
export interface Order {
    id: string; // The public_id (UUID) from the database
    internal_id: number; // The internal id (bigint)
    date: string;
    status: OrderStatus;
    total: number;
    items: CartItem[];
    trackingHistory: TrackingEvent[];
    shippingAddress: ShippingAddress;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
  points: number;
  rewardTier: Database['public']['Enums']['reward_tier'];
  referralCode: string;
  profilePicture?: string;
  // Seller-specific properties
  storeName?: string;
  isVerified?: boolean;
  commissionRate?: number;
}

export interface ShippingAddress {
    id?: number; // Added optional ID for DB records
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
}

export interface PaymentDetails {
    cardholderName: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

export interface Notification {
    id: number;
    message: string;
    type: Database['public']['Enums']['notification_type'];
    isRead: boolean;
    timestamp: string;
    metadata?: Json | null; // Replaces link for more flexibility
}


export interface Coupon {
    code: string;
    type: Database['public']['Enums']['coupon_discount_type'];
    value: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
}
