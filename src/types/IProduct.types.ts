import { UnitType } from '../models/Product.model';

export interface CreateProductCommand {
  name: string;
  code: string;
  price: number;
  costPrice?: number;
  stock: number;
  unitType?: UnitType;
  description?: string;
  category?: string;
}

export interface UpdateProductCommand {
  name?: string;
  code?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  category?: string;
  active?: boolean;
  unitType?: UnitType;
}

export interface StockChangeCommand {
  quantity: number;
}

export interface FindProductsQuery {
  category?: string;
  code: string;
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
  code: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  unitType: UnitType;
  category?: string;
  active: boolean;
  profit?: number;
  profitMargin?: number;
  createdAt: Date;
}

export interface PaginatedProductsDto {
  products: ProductDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}