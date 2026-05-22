import { Schema, model, Document, Model, Types } from 'mongoose';

// Tipo de promoción
export type PromotionType =
  | 'bundle'       
  | 'quantity'     
  | 'mixed';      

export interface IPromotionItem {
  product: Types.ObjectId;
  quantity: number;
  snapshotName: string;
  snapshotPrice: number;
}

export interface IPromotion extends Document {
  name: string;
  description?: string;
  type: PromotionType;
  items: IPromotionItem[];     
  promoPrice: number;          
  originalPrice: number;
  active: boolean;
  startsAt?: Date;
  endsAt?: Date;
  stock?: number;
  createdAt: Date;
  updatedAt: Date;
}

const promotionItemSchema = new Schema<IPromotionItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto es obligatorio'],
    },
    quantity: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad mínima es 1'],
    },
    snapshotName: {
      type: String,
      required: true,
    },
    snapshotPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false } 
);

const promotionSchema = new Schema<IPromotion>(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la promoción es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['bundle', 'quantity', 'mixed'],
      required: [true, 'El tipo de promoción es obligatorio'],
    },
    items: {
      type: [promotionItemSchema],
      validate: {
        validator: (items: IPromotionItem[]) => items.length >= 1,
        message: 'La promoción debe tener al menos un producto',
      },
    },
    promoPrice: {
      type: Number,
      required: [true, 'El precio promocional es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    originalPrice: {
      type: Number,
      required: [true, 'El precio original es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    active: {
      type: Boolean,
      default: true,
    },
    startsAt: {
      type: Date,
    },
    endsAt: {
      type: Date,
    },
    stock: {
      type: Number,
      min: [0, 'El stock no puede ser negativo'],
    },
  },
  { timestamps: true }
);

// Virtual: ahorro en pesos
promotionSchema.virtual('savings').get(function (this: IPromotion) {
  return this.originalPrice - this.promoPrice;
});

// Virtual: porcentaje de descuento
promotionSchema.virtual('discountPercentage').get(function (this: IPromotion) {
  if (this.originalPrice === 0) return 0;
  return Math.round(((this.originalPrice - this.promoPrice) / this.originalPrice) * 100);
});

// Índice para consultas de promos activas por fecha
promotionSchema.index({ active: 1, startsAt: 1, endsAt: 1 });

export const Promotion: Model<IPromotion> = model<IPromotion>('Promotion', promotionSchema);
