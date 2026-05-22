import { Schema, model, Document, Model, Types } from 'mongoose';

export type CashMovementType = 'retiro' | 'ingreso';

export interface ICashMovement extends Document {
  cashRegister: Types.ObjectId;
  user: Types.ObjectId;
  type: CashMovementType;
  amount: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cashMovementSchema = new Schema<ICashMovement>(
  {
    cashRegister: {
      type: Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: [true, 'La caja es obligatoria'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    type: {
      type: String,
      enum: ['retiro', 'ingreso'],
      required: [true, 'El tipo de movimiento es obligatorio'],
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0.01, 'El monto debe ser mayor a 0'],
    },
    reason: {
      type: String,
      required: [true, 'El motivo es obligatorio'],
      trim: true,
      maxlength: [200, 'El motivo no puede exceder 200 caracteres'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas no pueden exceder 500 caracteres'],
    },
  },
  { timestamps: true }
);

cashMovementSchema.index({ cashRegister: 1, createdAt: -1 });

export const CashMovement: Model<ICashMovement> = model<ICashMovement>('CashMovement', cashMovementSchema);
