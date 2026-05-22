import { Schema, model, Document, Model, Types } from 'mongoose';

export type CashRegisterStatus = 'abierta' | 'cerrada';

export interface ICashRegister extends Document {
  user: Types.ObjectId;
  status: CashRegisterStatus;
  openedAt: Date;
  closedAt?: Date;
  initialCash: number;
  finalCash?: number;
  totalWithdrawals: number;
  totalDeposits: number;
  cashCounted?: number;
  denominationCount?: Record<string, number>;
  totalCash: number;
  totalTransfer: number;
  totalCuentaCorriente: number;
  totalDebtPayments: number; // Pagos de deudas recibidos durante esta caja
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  salesCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cashRegisterSchema = new Schema<ICashRegister>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    status: {
      type: String,
      enum: ['abierta', 'cerrada'],
      default: 'abierta',
    },
    openedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    initialCash: {
      type: Number,
      required: [true, 'El monto inicial es obligatorio'],
      min: [0, 'El monto inicial no puede ser negativo'],
      default: 0,
    },
    finalCash: {
      type: Number,
      min: [0, 'El monto final no puede ser negativo'],
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeposits: {
      type: Number,
      default: 0,
      min: 0,
    },
    cashCounted: {
      type: Number,
      min: [0, 'El monto contado no puede ser negativo'],
    },
    denominationCount: {
      type: Schema.Types.Mixed,
    },
    totalCash: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalTransfer: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCuentaCorriente: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDebtPayments: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Índice para búsquedas rápidas de caja abierta
cashRegisterSchema.index({ status: 1 });

export const CashRegister: Model<ICashRegister> = model<ICashRegister>('CashRegister', cashRegisterSchema);
