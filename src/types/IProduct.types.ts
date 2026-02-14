export interface CreateProductCommand {
  name: string;
  price: number;
  stock: number;
  description?: string;
  category?: string;
}

export interface UpdateProductCommand {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  active?: boolean;
}

export interface StockChangeCommand {
  quantity: number;
}

export interface FindProductsQuery {
  category?: string;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  active: boolean;
  createdAt: Date;
}