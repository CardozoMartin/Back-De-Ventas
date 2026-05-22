/**
 * Schemas de validación con Zod para todas las entidades del sistema.
 * Cada schema valida y sanitiza los datos de entrada antes de llegar al controller.
 */
import { z } from 'zod';

// ==================== HELPERS ====================

/** Valida un string que parece un ObjectId de MongoDB */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido (debe ser un ObjectId de MongoDB)');

// ==================== USUARIOS ====================

export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(1, 'La contraseña es obligatoria'),
});

export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  email: z.string()
    .email('Email inválido')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),
  role: z.enum(['admin', 'vendedor'], {
    message: 'El rol debe ser "admin" o "vendedor"',
  }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['admin', 'vendedor']).optional(),
  isActive: z.boolean().optional(),
}).strict();

// ==================== PRODUCTOS ====================

export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del producto es obligatorio')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .trim(),
  code: z.string()
    .min(1, 'El código del producto es obligatorio')
    .max(50, 'El código no puede exceder 50 caracteres')
    .trim(),
  description: z.string().max(500).trim().optional(),
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(99999999, 'El precio es demasiado alto'),
  costPrice: z.number()
    .min(0, 'El precio de costo no puede ser negativo')
    .max(99999999, 'El precio de costo es demasiado alto')
    .default(0),
  stock: z.number()
    .min(0, 'El stock no puede ser negativo')
    .default(0),
  unitType: z.enum(['unidad', 'kilogramo']).default('unidad'),
  category: z.string().max(100).trim().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  code: z.string().min(1).max(50).trim().optional(),
  description: z.string().max(500).trim().optional(),
  price: z.number().min(0).max(99999999).optional(),
  costPrice: z.number().min(0).max(99999999).optional(),
  stock: z.number().min(0).optional(),
  unitType: z.enum(['unidad', 'kilogramo']).optional(),
  category: z.string().max(100).trim().optional(),
  active: z.boolean().optional(),
}).strict();

export const stockChangeSchema = z.object({
  quantity: z.number()
    .min(0.001, 'La cantidad debe ser mayor a 0')
    .max(999999, 'La cantidad es demasiado alta'),
});

// ==================== VENTAS ====================

const saleDetailSchema = z.object({
  productId: objectId,
  quantity: z.number()
    .min(0.001, 'La cantidad mínima es 0.001')
    .max(999999, 'La cantidad es demasiado alta'),
});

export const createSaleSchema = z.object({
  paymentMethod: z.enum(['efectivo', 'transferencia', 'cuenta_corriente'], {
    message: 'Método de pago inválido',
  }),
  details: z.array(saleDetailSchema)
    .min(1, 'La venta debe tener al menos un producto')
    .optional(),
  promotionId: objectId.optional(),
  promotionQuantity: z.number().int().min(1).max(100).optional(),
  notes: z.string().max(500).trim().optional(),
  clientId: objectId.optional(),
}).refine(
  (data) => data.details || data.promotionId,
  { message: 'La venta debe tener productos o una promoción' }
).refine(
  (data) => {
    if (data.paymentMethod === 'cuenta_corriente' && !data.clientId) {
      return false;
    }
    return true;
  },
  { message: 'Debe seleccionar un cliente para ventas a cuenta corriente' }
);

export const updateSaleSchema = z.object({
  status: z.enum(['pendiente', 'pagado', 'cancelado']).optional(),
  notes: z.string().max(500).trim().optional(),
}).strict();

// ==================== CAJA REGISTRADORA ====================

export const openCashRegisterSchema = z.object({
  initialCash: z.number()
    .min(0, 'El monto inicial no puede ser negativo')
    .max(99999999, 'El monto inicial es demasiado alto'),
  notes: z.string().max(500).trim().optional(),
});

export const closeCashRegisterSchema = z.object({
  cashCounted: z.number()
    .min(0, 'El monto contado no puede ser negativo'),
  denominationCount: z.record(z.string(), z.number().int().min(0)).optional(),
  notes: z.string().max(500).trim().optional(),
});

export const createCashMovementSchema = z.object({
  cashRegisterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de caja inválido'),
  type: z.enum(['retiro', 'ingreso'], {
    message: 'El tipo debe ser "retiro" o "ingreso"',
  }),
  amount: z.number()
    .min(0.01, 'El monto debe ser mayor a 0')
    .max(99999999, 'El monto es demasiado alto'),
  reason: z.string()
    .min(1, 'El motivo es obligatorio')
    .max(200, 'El motivo no puede exceder 200 caracteres')
    .trim(),
  notes: z.string().max(500).trim().optional(),
});

// ==================== CLIENTES ====================

export const createClientSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  phone: z.string().max(30).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  maxCredit: z.number().min(0).max(99999999).optional(),
});

export const updateClientSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(30).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  maxCredit: z.number().min(0).max(99999999).optional(),
  debt: z.number().min(0).optional(),
  active: z.boolean().optional(),
}).strict();

export const payDebtSchema = z.object({
  amount: z.number()
    .min(0.01, 'El monto del pago debe ser mayor a 0')
    .max(99999999, 'El monto del pago es demasiado alto'),
});

// ==================== PROMOCIONES ====================

const promotionItemSchema = z.object({
  product: objectId,
  quantity: z.number().int().min(1, 'La cantidad mínima es 1'),
  snapshotPrice: z.number().min(0).optional(),
  snapshotName: z.string().optional(),
});

export const createPromotionSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la promoción es obligatorio')
    .max(200)
    .trim(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(['bundle', 'quantity', 'mixed'], {
    message: 'El tipo de promoción es obligatorio',
  }),
  items: z.array(promotionItemSchema)
    .min(1, 'La promoción debe tener al menos un producto'),
  originalPrice: z.number().min(0),
  promoPrice: z.number().min(0),
  discountPercentage: z.number().min(0).max(100).optional(),
  savings: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().default(true),
  startsAt: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
  endsAt: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
});

export const updatePromotionSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(500).trim().optional(),
  type: z.enum(['bundle', 'quantity', 'mixed']).optional(),
  items: z.array(promotionItemSchema).min(1).optional(),
  originalPrice: z.number().min(0).optional(),
  promoPrice: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  savings: z.number().min(0).optional(),
  stock: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
  startsAt: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
  endsAt: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
}).strict();

// ==================== AUDITORÍA ====================

export const createAuditSchema = z.object({
  user: objectId,
  action: z.enum([
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT',
    'SALE_COMPLETED', 'SALE_CANCELLED',
    'PROMOTION_CREATED', 'PROMOTION_UPDATED', 'PROMOTION_DELETED',
    'DEBT_PAYMENT',
  ]),
  entity: z.enum(['User', 'Product', 'Sale', 'SaleDetail', 'Promotion', 'CashRegister', 'Client']),
  entityId: objectId.optional(),
  description: z.string().max(1000).trim().optional(),
});
