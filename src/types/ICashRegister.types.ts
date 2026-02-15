import { CashRegisterStatus } from '../models/CashRegister.model';

export interface OpenCashRegisterCommand {
  user: string;
  initialCash: number;
  notes?: string;
}

export interface CloseCashRegisterCommand {
  finalCash: number;
  leftForNext: number;
  notes?: string;
}

export interface CashRegisterDto {
  id: string;
  user: string;
  status: CashRegisterStatus;
  openedAt: Date;
  closedAt?: Date;
  initialCash: number;
  finalCash?: number;
  leftForNext: number;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  totalSales: number;
  salesCount: number;
  expectedCash?: number;
  difference?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
