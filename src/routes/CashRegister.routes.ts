import { Router } from "express";
import { container } from "tsyringe";
import { CashRegisterController } from "../controllers/CashRegister.controller";
import { verifyToken } from "../middlewares/TokeVerify";

const cashRegisterRoutes = Router();
const cashRegisterController = container.resolve(CashRegisterController);

// ==================== RUTAS ESPECÍFICAS (van primero) ====================

// Abrir caja - Requiere autenticación
cashRegisterRoutes.post(
  "/open",
  verifyToken,
  (req, res) => cashRegisterController.openCashRegister(req, res)
);

// Obtener caja abierta actualmente
cashRegisterRoutes.get(
  "/current",
  verifyToken,
  (req, res) => cashRegisterController.getOpenCashRegister(req, res)
);

// Obtener cajas por usuario
cashRegisterRoutes.get(
  "/user/:userId",
  verifyToken,
  (req, res) => cashRegisterController.getCashRegistersByUser(req, res)
);

// ==================== RUTAS GENÉRICAS (van al final) ====================

// Obtener todas las cajas
cashRegisterRoutes.get(
  "/",
  verifyToken,
  (req, res) => cashRegisterController.getAllCashRegisters(req, res)
);

// Obtener caja por ID
cashRegisterRoutes.get(
  "/:id",
  verifyToken,
  (req, res) => cashRegisterController.getCashRegisterById(req, res)
);

// Cerrar caja - Requiere autenticación
cashRegisterRoutes.post(
  "/:id/close",
  verifyToken,
  (req, res) => cashRegisterController.closeCashRegister(req, res)
);

export default cashRegisterRoutes;
