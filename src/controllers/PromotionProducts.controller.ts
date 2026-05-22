import { injectable } from "tsyringe";
import { PromotionService } from "../service/PromotionProducts.service";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class PromotionController {
  constructor(private promotionService: PromotionService) { }

  // Controlador para crear una promoción
  createPromotion = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const promotion = await this.promotionService.createPromotion(req.body, user._id || user.id, ip);
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción creada exitosamente",
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  // Controlador para obtener una promoción por ID
  getPromotionById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const promotion = await this.promotionService.getPromotionById(req.params.id);
      if (!promotion) {
        throw new AppError("No se encontró una promoción con el ID proporcionado", 404, "PROMOTION_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción obtenida exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para obtener todas las promociones
  getAllPromotions = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.promotionService.getAllPromotions(page, limit);
      const response: ISuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Promociones obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para obtener promociones activas
  getActivePromotions = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.promotionService.getActivePromotions(page, limit);
      const response: ISuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Promociones activas obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para actualizar una promoción
  updatePromotion = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

      const promotion = await this.promotionService.updatePromotion(req.params.id, req.body, user._id || user.id, ip);
      if (!promotion) {
        throw new AppError("No se encontró una promoción con el ID proporcionado", 404, "PROMOTION_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción actualizada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para eliminar una promoción
  deletePromotion = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

      await this.promotionService.deletePromotion(req.params.id, user._id || user.id, ip);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Promoción eliminada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para aumentar el stock
  increaseStock = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        throw new AppError("La cantidad debe ser mayor a 0", 400, "INVALID_QUANTITY");
      }
      const promotion = await this.promotionService.increaseStock(req.params.id, quantity, user._id || user.id, ip);
      if (!promotion) {
        throw new AppError("No se encontró una promoción con el ID proporcionado", 404, "PROMOTION_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: `Stock aumentado exitosamente (+${quantity})`,
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para disminuir el stock
  decreaseStock = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        throw new AppError("La cantidad debe ser mayor a 0", 400, "INVALID_QUANTITY");
      }
      const promotion = await this.promotionService.decreaseStock(req.params.id, quantity, user._id || user.id, ip);
      if (!promotion) {
        throw new AppError("No se encontró una promoción con el ID proporcionado", 404, "PROMOTION_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: `Stock disminuido exitosamente (-${quantity})`,
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para desactivar una promoción
  deactivatePromotion = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

      const promotion = await this.promotionService.deactivatePromotion(req.params.id, user._id || user.id, ip);
      if (!promotion) {
        throw new AppError("No se encontró una promoción con el ID proporcionado", 404, "PROMOTION_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción desactivada exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  // Controlador para obtener todas las promociones sin paginación
  getAllPromotionsNoPagination = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const promotions = await this.promotionService.getAllPromotionsSinPage();
      const response: ISuccessResponse<typeof promotions> = {
        success: true,
        data: promotions,
        message: "Promociones obtenidas exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
