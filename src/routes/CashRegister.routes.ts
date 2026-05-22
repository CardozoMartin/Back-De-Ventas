import { Router } from "express";
import { container } from "tsyringe";
import { CashRegisterController } from "../controllers/CashRegister.controller";
import { verifyToken } from "../middlewares/TokenVerify";
import { validate } from "../middlewares/validateRequest";
import { openCashRegisterSchema, closeCashRegisterSchema } from "../middlewares/schemas";

const cashRegisterRoutes = Router();
const cashRegisterController = container.resolve(CashRegisterController);

// ==================== RUTAS ESPECÍFICAS (van primero) ====================

// Abrir caja - Requiere autenticación + validación
cashRegisterRoutes.post(
  "/open",
  verifyToken,
  validate(openCashRegisterSchema),
  cashRegisterController.openCashRegister
);

// Obtener caja abierta actualmente
cashRegisterRoutes.get(
  "/current",
  verifyToken,
  cashRegisterController.getOpenCashRegister
);

// Obtener cajas por usuario
cashRegisterRoutes.get(
  "/user/:userId",
  verifyToken,
  cashRegisterController.getCashRegistersByUser
);

// ==================== RUTAS GENÉRICAS (van al final) ====================

// Obtener todas las cajas
cashRegisterRoutes.get(
  "/",
  verifyToken,
  cashRegisterController.getAllCashRegisters
);

// Obtener caja por ID
cashRegisterRoutes.get(
  "/:id",
  verifyToken,
  cashRegisterController.getCashRegisterById
);

// Cerrar caja - Requiere autenticación + validación
cashRegisterRoutes.post(
  "/:id/close",
  verifyToken,
  validate(closeCashRegisterSchema),
  cashRegisterController.closeCashRegister
);

export default cashRegisterRoutes;
