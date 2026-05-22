import { injectable } from "tsyringe";
import { SaleService } from "../service/Sale.service";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class SaleController {
  constructor(private saleService: SaleService) { }

  //controlador para crear una venta
  createSale = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const sale = await this.saleService.createSale(req.body, user._id || user.id, ip);
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta creada exitosamente",
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  //controlador para obtener una venta por id
  getSaleById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const sale = await this.saleService.getSaleById(req.params.id);
      if (!sale) {
        throw new AppError("No se encontró una venta con el ID proporcionado", 404, "SALE_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta obtenida exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener todas las ventas
  getAllSales = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await this.saleService.getAllSales(page, limit);
      
      const response = {
        success: true,
        data: result.sales,
        pagination: {
          totalRecords: result.totalRecords,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
          limit: limit || result.totalRecords
        },
        message: "Ventas obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener ventas por vendedor
  getSalesBySeller = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { sellerId } = req.params;
      const sales = await this.saleService.getSalesBySeller(sellerId);
      const response: ISuccessResponse<typeof sales> = {
        success: true,
        data: sales,
        message: "Ventas del vendedor obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener ventas por caja registradora
  getSalesByCashRegister = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { cashRegisterId } = req.params;
      const sales = await this.saleService.getSalesByCashRegister(cashRegisterId);
      const response: ISuccessResponse<typeof sales> = {
        success: true,
        data: sales,
        message: "Ventas de la caja obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para actualizar una venta
  updateSale = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
      const sale = await this.saleService.updateSale(req.params.id, req.body, user._id || user.id, ip);
      if (!sale) {
        throw new AppError("No se encontró una venta con el ID proporcionado", 404, "SALE_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta actualizada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para cancelar una venta
  cancelSale = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
      const sale = await this.saleService.cancelSale(req.params.id, user._id || user.id, ip);
      if (!sale) {
        throw new AppError("No se encontró una venta con el ID proporcionado", 404, "SALE_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta cancelada exitosamente. Se devolvió el stock a los productos.",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para completar una venta (de pendiente a pagado)
  completeSale = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
      const sale = await this.saleService.completeSale(req.params.id, user._id || user.id, ip);
      if (!sale) {
        throw new AppError("No se encontró una venta con el ID proporcionado", 404, "SALE_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof sale> = {
        success: true,
        data: sale,
        message: "Venta completada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
