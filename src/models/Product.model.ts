import { Schema, model, Document, Model } from 'mongoose';

export type UnitType = 'unidad' | 'kilogramo';

export interface IProduct extends Document {
  name: string;
  code: string;
  description?: string;
  price: number;
  costPrice: number;
  stock: number;
  unitType: UnitType;
  category?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'El código del producto es obligatorio'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    costPrice: {
      type: Number,
      required: [true, 'El precio de costo es obligatorio'],
      min: [0, 'El precio de costo no puede ser negativo'],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },
    unitType: {
      type: String,
      enum: ['unidad', 'kilogramo'],
      default: 'unidad',
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ==================== ÍNDICES ====================
// Búsqueda de texto por nombre de producto
productSchema.index({ name: 'text', description: 'text' });
// Filtro frecuente: productos activos por categoría
productSchema.index({ active: 1, category: 1 });
// Stock bajo alertas
productSchema.index({ active: 1, stock: 1 });

export const Product: Model<IProduct> = model<IProduct>('Product', productSchema);
