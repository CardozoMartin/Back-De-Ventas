import { injectable } from 'tsyringe';
import { CashMovementService } from '../service/CashMovement.service';
import { ISuccessResponse, IErrorResponse } from '../types/IResponse.types';
import { Request, Response, NextFunction } from 'express';
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class CashMovementController {
  constructor(private cashMovementService: CashMovementService) {}

  createMovement = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const { cashRegisterId, type, amount, reason, notes } = req.body;

      const movement = await this.cashMovementService.createMovement({
        cashRegister: cashRegisterId,
        user: user._id || user.id,
        type,
        amount,
        reason,
        notes,
      }, ip);

      const response: ISuccessResponse<typeof movement> = {
        success: true,
        data: movement,
        message: `${type === 'retiro' ? 'Retiro' : 'Ingreso'} registrado exitosamente`,
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  getMovementsByCashRegister = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { cashRegisterId } = req.params;
      const movements = await this.cashMovementService.getMovementsByCashRegister(cashRegisterId);

      const response: ISuccessResponse<typeof movements> = {
        success: true,
        data: movements,
        message: 'Movimientos obtenidos exitosamente',
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
