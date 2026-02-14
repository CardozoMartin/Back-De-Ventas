import { Schema, model, Document, Model, Types } from 'mongoose';

export type SaleStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface ISale extends Document {
  seller: Types.ObjectId;
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
    total: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'transfer'],
      required: [true, 'El método de pago es obligatorio'],
    },
    notes: {
      type: String,
      trim: true,
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