import { SaleStatus, PaymentMethod } from "../models/Sale.model";
import { UnitType } from "../models/Product.model";

export interface CreateSaleDetailCommand {
  productId: string;
  quantity: number;
}

export interface CreateSaleCommand {
  seller: string;
  paymentMethod: PaymentMethod;
  details?: CreateSaleDetailCommand[];
  promotionId?: string;
  notes?: string;
}

export interface UpdateSaleCommand {
  status?: SaleStatus;
  notes?: string;
}

export interface SaleDetailDto {
  id: string;
  sale: string;
  product: string;
  productName: string;
  unitType: UnitType;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  profit?: number;
  createdAt: Date;
}

export interface SaleDto {
  id: string;
  seller: string;
  cashRegister: string;
  promotion?: string;
  total: number;
  totalProfit?: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  details?: SaleDetailDto[];
  createdAt: Date;
  updatedAt: Date;
}
