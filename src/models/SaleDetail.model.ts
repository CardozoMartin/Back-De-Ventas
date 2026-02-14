import { Schema, model, Document, Model, Types } from 'mongoose';

export interface ISaleDetail extends Document {
  sale: Types.ObjectId;
  product: Types.ObjectId;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
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
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima es 1'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

saleDetailSchema.pre('save', function (next) {
  this.subtotal = this.unitPrice * this.quantity;
  next();
});

export const SaleDetail: Model<ISaleDetail> = model<ISaleDetail>('SaleDetail', saleDetailSchema);