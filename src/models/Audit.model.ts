import { Schema, model, Document, Model, Types } from 'mongoose';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SALE_COMPLETED'
  | 'SALE_CANCELLED';

export type AuditEntity = 'User' | 'Product' | 'Sale' | 'SaleDetail';

export interface IAudit extends Document {
  user: Types.ObjectId;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: Types.ObjectId;
  description?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SALE_COMPLETED', 'SALE_CANCELLED'],
    },
    entity: {
      type: String,
      required: true,
      enum: ['User', 'Product', 'Sale', 'SaleDetail'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    description: {
      type: String,
      trim: true,
    },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Los registros de auditoría son inmutables
auditSchema.pre(['updateOne', 'findOneAndUpdate', 'deleteOne'], function () {
  throw new Error('Los registros de auditoría son inmutables');
});

export const Audit: Model<IAudit> = model<IAudit>('Audit', auditSchema);