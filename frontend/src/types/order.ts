import { Product } from "./product";
import { User } from "./auth";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "return_requested"
  | "returned"
  | "cancelled";

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id?: number | null;
  product_id?: number | null;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  tracking_number?: string | null;
  delivery_date?: string | null;
  order_date?: string;
  created_at: string;
  updated_at?: string | null;
  buyer?: User | null;
  seller?: User | null;
  product?: Product | null;
}

export interface OrderCreateRequest {
  seller_id?: number;
  product_id?: number;
  quantity?: number;
  total_amount?: number;
  tracking_number?: string;
  product_name?: string;
  brand?: string;
  serial_number?: string;
  delivery_date?: string;
}

export interface OrderUpdateRequest {
  tracking_number?: string | null;
  delivery_date?: string | null;
  status?: OrderStatus;
  quantity?: number;
  total_amount?: number;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}
