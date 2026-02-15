import { injectable } from "tsyringe";
import { SaleService } from "../service/Sale.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class SaleController {
  constructor(private saleService: SaleService) { }

  //controlador para crear una venta
  async createSale(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const sale = await this.saleService.createSale(req.body, user._id || user.id, ip);
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta creada exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear la venta",
        errorCode: "SALE_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener una venta por id
  async getSaleById(req: Request, res: Response): Promise<Response> {
    try {
      const sale = await this.saleService.getSaleById(req.params.id);
      if (!sale) {
        const response: IErrorResponse = {
          success: false,
          error: "Venta no encontrada",
          errorCode: "SALE_NOT_FOUND",
          message: "No se encontró una venta con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta obtenida exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener la venta",
        errorCode: "SALE_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener todas las ventas
  async getAllSales(req: Request, res: Response): Promise<Response> {
    try {
      const sales = await this.saleService.getAllSales();
      const response: ISuccessResponse<typeof sales> = {
        success: true,
        data: sales,
        message: "Ventas obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las ventas",
        errorCode: "SALES_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener ventas por vendedor
  async getSalesBySeller(req: Request, res: Response): Promise<Response> {
    try {
      const { sellerId } = req.params;
      const sales = await this.saleService.getSalesBySeller(sellerId);
      const response: ISuccessResponse<typeof sales> = {
        success: true,
        data: sales,
        message: "Ventas del vendedor obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las ventas del vendedor",
        errorCode: "SELLER_SALES_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener ventas por caja registradora
  async getSalesByCashRegister(req: Request, res: Response): Promise<Response> {
    try {
      const { cashRegisterId } = req.params;
      const sales = await this.saleService.getSalesByCashRegister(cashRegisterId);
      const response: ISuccessResponse<typeof sales> = {
        success: true,
        data: sales,
        message: "Ventas de la caja obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las ventas de la caja",
        errorCode: "CASH_REGISTER_SALES_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para actualizar una venta
  async updateSale(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const sale = await this.saleService.updateSale(req.params.id, req.body, user._id || user.id, ip);
      if (!sale) {
        const response: IErrorResponse = {
          success: false,
          error: "Venta no encontrada",
          errorCode: "SALE_NOT_FOUND",
          message: "No se encontró una venta con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta actualizada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al actualizar la venta",
        errorCode: "SALE_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para cancelar una venta
  async cancelSale(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const sale = await this.saleService.cancelSale(req.params.id, user._id || user.id, ip);
      if (!sale) {
        const response: IErrorResponse = {
          success: false,
          error: "Venta no encontrada",
          errorCode: "SALE_NOT_FOUND",
          message: "No se encontró una venta con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta cancelada exitosamente. Se devolvió el stock a los productos.",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al cancelar la venta",
        errorCode: "SALE_CANCELLATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para completar una venta (de pendiente a pagado)
  async completeSale(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const sale = await this.saleService.completeSale(req.params.id, user._id || user.id, ip);
      if (!sale) {
        const response: IErrorResponse = {
          success: false,
          error: "Venta no encontrada",
          errorCode: "SALE_NOT_FOUND",
          message: "No se encontró una venta con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta completada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al completar la venta",
        errorCode: "SALE_COMPLETION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
