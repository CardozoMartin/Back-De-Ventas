import { Schema, model, Document, Model, Types } from 'mongoose';

export type SaleStatus = 'pendiente' | 'pagado' | 'cancelado';
export type PaymentMethod = 'efectivo' | 'transferencia' | 'cuenta_corriente';

export interface ISale extends Document {
  seller: Types.ObjectId;
  cashRegister: Types.ObjectId;
  promotion?: Types.ObjectId;
  total: number;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El vendedor es obligatorio'],
    },
    cashRegister: {
      type: Schema.Types.ObjectId,
      ref: 'CashRegister',
      required: [true, 'La caja registradora es obligatoria'],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pendiente', 'pagado', 'cancelado'],
      default: 'pendiente',
    },
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'transferencia', 'cuenta_corriente'],
      required: [true, 'El método de pago es obligatorio'],
    },
    notes: {
      type: String,
      trim: true,
    },
    promotion: {
      type: Schema.Types.ObjectId,
      ref: 'Promotion',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

saleSchema.virtual('details', {
  ref: 'SaleDetail',
  localField: '_id',
  foreignField: 'sale',
});

export const Sale: Model<ISale> = model<ISale>('Sale', saleSchema);