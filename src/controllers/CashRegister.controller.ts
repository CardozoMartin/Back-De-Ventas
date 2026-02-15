import { injectable } from "tsyringe";
import { CashRegisterService } from "../service/CashRegister.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class CashRegisterController {
  constructor(private cashRegisterService: CashRegisterService) { }

  //controlador para abrir una caja
  async openCashRegister(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const { initialCash, notes } = req.body;

      if (initialCash === undefined || initialCash < 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Monto inicial inválido",
          errorCode: "INVALID_INITIAL_CASH",
          message: "El monto inicial debe ser mayor o igual a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
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
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al abrir la caja",
        errorCode: "CASH_REGISTER_OPEN_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener caja abierta
  async getOpenCashRegister(req: Request, res: Response): Promise<Response> {
    try {
      const cashRegister = await this.cashRegisterService.getOpenCashRegister();
      
      if (!cashRegister) {
        const response: IErrorResponse = {
          success: false,
          error: "No hay caja abierta",
          errorCode: "NO_OPEN_CASH_REGISTER",
          message: "No existe ninguna caja abierta actualmente",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja abierta obtenida exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener la caja abierta",
        errorCode: "CASH_REGISTER_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener una caja por id
  async getCashRegisterById(req: Request, res: Response): Promise<Response> {
    try {
      const cashRegister = await this.cashRegisterService.getCashRegisterById(req.params.id);
      
      if (!cashRegister) {
        const response: IErrorResponse = {
          success: false,
          error: "Caja no encontrada",
          errorCode: "CASH_REGISTER_NOT_FOUND",
          message: "No se encontró una caja con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja obtenida exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener la caja",
        errorCode: "CASH_REGISTER_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener todas las cajas
  async getAllCashRegisters(req: Request, res: Response): Promise<Response> {
    try {
      const cashRegisters = await this.cashRegisterService.getAllCashRegisters();
      
      const response: ISuccessResponse<typeof cashRegisters> = {
        success: true,
        data: cashRegisters,
        message: "Cajas obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las cajas",
        errorCode: "CASH_REGISTERS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener cajas por usuario
  async getCashRegistersByUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const cashRegisters = await this.cashRegisterService.getCashRegistersByUser(userId);
      
      const response: ISuccessResponse<typeof cashRegisters> = {
        success: true,
        data: cashRegisters,
        message: "Cajas del usuario obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las cajas del usuario",
        errorCode: "USER_CASH_REGISTERS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para cerrar una caja
  async closeCashRegister(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const { finalCash, leftForNext, notes } = req.body;

      if (finalCash === undefined || finalCash < 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Monto final inválido",
          errorCode: "INVALID_FINAL_CASH",
          message: "El monto final debe ser mayor o igual a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      if (leftForNext === undefined || leftForNext < 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Monto dejado inválido",
          errorCode: "INVALID_LEFT_FOR_NEXT",
          message: "El monto dejado para la próxima caja debe ser mayor o igual a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }

      const cashRegister = await this.cashRegisterService.closeCashRegister(
        req.params.id,
        { finalCash, leftForNext, notes },
        user._id || user.id,
        ip
      );

      if (!cashRegister) {
        const response: IErrorResponse = {
          success: false,
          error: "Caja no encontrada",
          errorCode: "CASH_REGISTER_NOT_FOUND",
          message: "No se encontró una caja con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }

      const response: ISuccessResponse<typeof cashRegister> = {
        success: true,
        data: cashRegister,
        message: "Caja cerrada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al cerrar la caja",
        errorCode: "CASH_REGISTER_CLOSE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
