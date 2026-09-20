export type Category = 'men' | 'women' | 'kids';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category: Category;
  subcategory: string | null;
  image_url: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  is_new: boolean;
  tags: string[];
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
  product?: Product;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_fee: number;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  created_at: string;
}
