export interface Product {
  id: number;
  product_name: string;
  name?: string; // backward compat
  description?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  price: number;
  serial_number?: string | null;
  seller_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ProductCreateRequest {
  product_name: string;
  description?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  price: number;
  serial_number?: string | null;
  seller_id?: number | null;
}

export interface ProductUpdateRequest {
  product_name?: string;
  description?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  price?: number;
  serial_number?: string | null;
}

export interface ProductListFilter {
  category?: string;
  brand?: string;
  seller_id?: number;
  skip?: number;
  limit?: number;
}
