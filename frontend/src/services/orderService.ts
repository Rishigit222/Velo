import { apiClient } from "@/lib/apiClient";
import {
  Order,
  OrderCreateRequest,
  OrderStatus,
  OrderStatusUpdateRequest,
  OrderUpdateRequest,
} from "@/types";

export const orderService = {
  /**
   * List orders accessible to the current user (Buyer gets theirs, Seller gets assigned, Admin gets all)
   */
  async list(skip = 0, limit = 50): Promise<Order[]> {
    return apiClient.get<Order[]>("/orders", {
      params: { skip, limit },
    });
  },

  /**
   * Get single order by ID
   */
  async getById(orderId: number): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  /**
   * Create new order (Buyers and Admins)
   */
  async create(data: OrderCreateRequest): Promise<Order> {
    return apiClient.post<Order>("/orders", data);
  },

  /**
   * Update permitted order details (Seller or Admin)
   */
  async update(orderId: number, data: OrderUpdateRequest): Promise<Order> {
    return apiClient.put<Order>(`/orders/${orderId}`, data);
  },

  /**
   * Update order status with strict lifecycle transition validation
   */
  async updateStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const payload: OrderStatusUpdateRequest = { status };
    return apiClient.patch<Order>(`/orders/${orderId}/status`, payload);
  },
};
