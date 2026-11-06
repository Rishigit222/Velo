import { Product } from "./product";

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
  buyer_id: number;
  seller_id: number;
  product_id: number;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  tracking_number: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
  product?: Product | null;
}

export interface OrderCreateRequest {
  seller_id: number;
  product_id?: number;
  product_name?: string;
  quantity?: number;
  total_amount?: number;
  tracking_number?: string;
}

export interface OrderUpdateRequest {
  tracking_number?: string | null;
  delivery_date?: string | null;
  status?: OrderStatus;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}
