export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  category: string;
  brand: string | null;
  price: number;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string | null;
  sku: string;
  category: string;
  brand?: string | null;
  price: number;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string | null;
  category?: string;
  brand?: string | null;
  price?: number;
}

export interface ProductListFilter {
  category?: string;
  brand?: string;
  seller_id?: number;
  skip?: number;
  limit?: number;
}
