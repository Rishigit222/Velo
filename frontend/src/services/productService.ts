import { apiClient } from "@/lib/apiClient";
import {
  Product,
  ProductCreateRequest,
  ProductListFilter,
  ProductUpdateRequest,
} from "@/types";

export const productService = {
  /**
   * List products with optional filtering and pagination
   */
  async list(filters?: ProductListFilter): Promise<Product[]> {
    return apiClient.get<Product[]>("/products", {
      params: filters as Record<string, string | number | boolean | undefined | null>,
    });
  },

  /**
   * Get single product by ID
   */
  async getById(productId: number): Promise<Product> {
    return apiClient.get<Product>(`/products/${productId}`);
  },

  /**
   * Create a new product (Sellers and Admins)
   */
  async create(data: ProductCreateRequest): Promise<Product> {
    return apiClient.post<Product>("/products", data);
  },

  /**
   * Update a product (Product owner or Admin)
   */
  async update(productId: number, data: ProductUpdateRequest): Promise<Product> {
    return apiClient.put<Product>(`/products/${productId}`, data);
  },

  /**
   * Safe delete a product (Owner or Admin; blocked if order exists)
   */
  async delete(productId: number): Promise<void> {
    return apiClient.delete<void>(`/products/${productId}`);
  },
};
