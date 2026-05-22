import { CashRegisterStatus } from '../models/CashRegister.model';

export interface DenominationCount {
  [denomination: string]: number;
}

export interface OpenCashRegisterCommand {
  user: string;
  initialCash: number;
  notes?: string;
}

export interface CloseCashRegisterCommand {
  cashCounted: number;
  denominationCount?: DenominationCount;
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
  totalWithdrawals: number;
  totalDeposits: number;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  totalDebtPayments: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  salesCount: number;
  cashCounted?: number;
  denominationCount?: DenominationCount;
  expectedCash?: number;
  difference?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
