import { injectable } from "tsyringe";
import { CashRegisterService } from "../service/CashRegister.service";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class CashRegisterController {
  constructor(private cashRegisterService: CashRegisterService) { }

  //controlador para abrir una caja
  openCashRegister = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const { initialCash, notes } = req.body;
    
      if (initialCash === undefined || initialCash < 0) {
        throw new AppError("El monto inicial debe ser mayor o igual a 0", 400, "INVALID_INITIAL_CASH");
      }

      const cashRegister = await this.cashRegisterService.openCashRegister({
        user: user._id || user.id,
        initialCash,
        notes
      }, ip);

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja abierta exitosamente",
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  //controlador para obtener caja abierta
  getOpenCashRegister = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
      const cashRegister = await this.cashRegisterService.getOpenCashRegister(user?._id || user?.id);
      
      if (!cashRegister) {
        const response: ISuccessResponse<null> = {
          success: true,
          data: null,
          message: "No existe ninguna caja abierta actualmente",
          timestamp: new Date(),
        };
        res.status(200).json(response);
        return;
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja abierta obtenida exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener una caja por id
  getCashRegisterById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const cashRegister = await this.cashRegisterService.getCashRegisterById(req.params.id);
      
      if (!cashRegister) {
        throw new AppError("No se encontró una caja con el ID proporcionado", 404, "CASH_REGISTER_NOT_FOUND");
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja obtenida exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener todas las cajas
  getAllCashRegisters = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const cashRegisters = await this.cashRegisterService.getAllCashRegisters();
      
      const response: ISuccessResponse<typeof cashRegisters> = {
        success: true,
        data: cashRegisters,
        message: "Cajas obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener cajas por usuario
  getCashRegistersByUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { userId } = req.params;
      const cashRegisters = await this.cashRegisterService.getCashRegistersByUser(userId);
      
      const response: ISuccessResponse<typeof cashRegisters> = {
        success: true,
        data: cashRegisters,
        message: "Cajas del usuario obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para cerrar una caja
  closeCashRegister = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
      const { cashCounted, denominationCount, notes } = req.body;

      if (cashCounted === undefined || cashCounted < 0) {
        throw new AppError("El monto contado debe ser mayor o igual a 0", 400, "INVALID_CASH_COUNTED");
      }

      const cashRegister = await this.cashRegisterService.closeCashRegister(
        req.params.id,
        { cashCounted, denominationCount, notes },
        user._id || user.id,
        ip
      );

      if (!cashRegister) {
        throw new AppError("No se encontró una caja con el ID proporcionado", 404, "CASH_REGISTER_NOT_FOUND");
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja cerrada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
