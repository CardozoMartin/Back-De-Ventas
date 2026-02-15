import { PromotionType, IPromotionItem } from '../models/PromotionProducts.model';

export interface CreatePromotionCommand {
  name: string;
  description?: string;
  type: PromotionType;
  items: IPromotionItem[];
  promoPrice: number;
  originalPrice: number;
  active?: boolean;
  startsAt?: Date;
  endsAt?: Date;
  stock?: number;
}

export interface UpdatePromotionCommand {
  name?: string;
  description?: string;
  type?: PromotionType;
  items?: IPromotionItem[];
  promoPrice?: number;
  originalPrice?: number;
  active?: boolean;
  startsAt?: Date;
  endsAt?: Date;
  stock?: number;
}

export interface PromotionDto {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  items: IPromotionItem[];
  promoPrice: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  active: boolean;
  startsAt?: Date;
  endsAt?: Date;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedPromotionsDto {
  promotions: PromotionDto[];
  pagination: PaginationMetadata;
}

export interface StockChangeCommand {
  quantity: number;
}
