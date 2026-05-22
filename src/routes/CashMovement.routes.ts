import { Router } from 'express';
import { container } from 'tsyringe';
import { CashMovementController } from '../controllers/CashMovement.controller';
import { verifyToken } from '../middlewares/TokenVerify';
import { validate } from '../middlewares/validateRequest';
import { createCashMovementSchema } from '../middlewares/schemas';

const cashMovementRoutes = Router();
const cashMovementController = container.resolve(CashMovementController);

// Crear movimiento de caja (retiro/ingreso)
cashMovementRoutes.post(
  '/',
  verifyToken,
  validate(createCashMovementSchema),
  cashMovementController.createMovement
);

// Obtener movimientos por caja
cashMovementRoutes.get(
  '/:cashRegisterId',
  verifyToken,
  cashMovementController.getMovementsByCashRegister
);

export default cashMovementRoutes;
