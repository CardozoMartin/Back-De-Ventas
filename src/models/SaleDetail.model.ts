import { Schema, model, Document, Model, Types } from 'mongoose';
import { UnitType } from './Product.model';

export interface ISaleDetail extends Document {
  sale: Types.ObjectId;
  product: Types.ObjectId;
  productName: string;
  unitType: UnitType;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  profit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const saleDetailSchema = new Schema<ISaleDetail>(
  {
    sale: {
      type: Schema.Types.ObjectId,
      ref: 'Sale',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    unitType: {
      type: String,
      enum: ['unidad', 'kilogramo'],
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'La cantidad mínima es 0.001'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

saleDetailSchema.pre('save', function (next) {
  this.subtotal = this.unitPrice * this.quantity;
  this.profit = (this.unitPrice - this.costPrice) * this.quantity;
  next();
});

export const SaleDetail: Model<ISaleDetail> = model<ISaleDetail>('SaleDetail', saleDetailSchema);