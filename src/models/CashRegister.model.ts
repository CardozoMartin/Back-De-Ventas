import { Schema, model, Document, Model, Types } from 'mongoose';

export type CashRegisterStatus = 'abierta' | 'cerrada';

export interface ICashRegister extends Document {
  user: Types.ObjectId;
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
    leftForNext: {
      type: Number,
      default: 0,
      min: [0, 'El monto dejado para la próxima caja no puede ser negativo'],
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
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
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
