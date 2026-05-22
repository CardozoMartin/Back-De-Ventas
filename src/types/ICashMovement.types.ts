import { CashMovementType } from '../models/CashMovement.model';

export interface CreateCashMovementCommand {
  cashRegister: string;
  user: string;
  type: CashMovementType;
  amount: number;
  reason: string;
  notes?: string;
}

export interface CashMovementDto {
  id: string;
  cashRegister: string;
  user: string;
  type: CashMovementType;
  amount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
