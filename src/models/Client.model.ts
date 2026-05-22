import { Schema, model, Document, Model } from 'mongoose';

export interface IClient extends Document {
  name: string;
  phone?: string;
  email?: string;
  debt: number; // Deuda acumulada del cliente
  maxCredit?: number; // Límite de crédito opcional para fiar
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'El nombre completo del cliente es obligatorio'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    debt: {
      type: Number,
      default: 0, // Inicia sin deudas
      min: [0, 'La deuda no puede ser negativa'],
    },
    maxCredit: {
      type: Number,
      default: 0, // 0 significa sin límite específico o deshabilitado si lo manejamos así
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Client: Model<IClient> = model<IClient>('Client', clientSchema);
