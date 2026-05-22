import { injectable } from 'tsyringe';
import { CashMovementService } from '../service/CashMovement.services';
import { ISuccessResponse, IErrorResponse } from '../types/IResponse.types';
import { Request, Response } from 'express';

@injectable()
export class CashMovementController {
  constructor(private cashMovementService: CashMovementService) {}

  async createMovement(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
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
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: 'Error al registrar movimiento',
        errorCode: 'CASH_MOVEMENT_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async getMovementsByCashRegister(req: Request, res: Response): Promise<Response> {
    try {
      const { cashRegisterId } = req.params;
      const movements = await this.cashMovementService.getMovementsByCashRegister(cashRegisterId);

      const response: ISuccessResponse<typeof movements> = {
        success: true,
        data: movements,
        message: 'Movimientos obtenidos exitosamente',
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: 'Error al obtener movimientos',
        errorCode: 'CASH_MOVEMENTS_RETRIEVAL_ERROR',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
