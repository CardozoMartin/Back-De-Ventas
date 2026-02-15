import { injectable } from "tsyringe";
import { PromotionService } from "../service/PromotionProducts.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class PromotionController {
  constructor(private promotionService: PromotionService) { }

  // Controlador para crear una promoción
  async createPromotion(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const promotion = await this.promotionService.createPromotion(req.body, user._id || user.id, ip);
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción creada exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear la promoción",
        errorCode: "PROMOTION_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para obtener una promoción por ID
  async getPromotionById(req: Request, res: Response): Promise<Response> {
    try {
      const promotion = await this.promotionService.getPromotionById(req.params.id);
      if (!promotion) {
        const response: IErrorResponse = {
          success: false,
          error: "Promoción no encontrada",
          errorCode: "PROMOTION_NOT_FOUND",
          message: "No se encontró una promoción con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción obtenida exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener la promoción",
        errorCode: "PROMOTION_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para obtener todas las promociones
  async getAllPromotions(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.promotionService.getAllPromotions(page, limit);
      const response: ISuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Promociones obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las promociones",
        errorCode: "PROMOTIONS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para obtener promociones activas
  async getActivePromotions(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.promotionService.getActivePromotions(page, limit);
      const response: ISuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: "Promociones activas obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las promociones activas",
        errorCode: "ACTIVE_PROMOTIONS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para actualizar una promoción
  async updatePromotion(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const promotion = await this.promotionService.updatePromotion(req.params.id, req.body, user._id || user.id, ip);
      if (!promotion) {
        const response: IErrorResponse = {
          success: false,
          error: "Promoción no encontrada",
          errorCode: "PROMOTION_NOT_FOUND",
          message: "No se encontró una promoción con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción actualizada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al actualizar la promoción",
        errorCode: "PROMOTION_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para eliminar una promoción
  async deletePromotion(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      await this.promotionService.deletePromotion(req.params.id, user._id || user.id, ip);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Promoción eliminada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al eliminar la promoción",
        errorCode: "PROMOTION_DELETION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para aumentar el stock
  async increaseStock(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Cantidad inválida",
          errorCode: "INVALID_QUANTITY",
          message: "La cantidad debe ser mayor a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const promotion = await this.promotionService.increaseStock(req.params.id, quantity, user._id || user.id, ip);
      if (!promotion) {
        const response: IErrorResponse = {
          success: false,
          error: "Promoción no encontrada",
          errorCode: "PROMOTION_NOT_FOUND",
          message: "No se encontró una promoción con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: `Stock aumentado exitosamente (+${quantity})`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al aumentar el stock",
        errorCode: "STOCK_INCREASE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para disminuir el stock
  async decreaseStock(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Cantidad inválida",
          errorCode: "INVALID_QUANTITY",
          message: "La cantidad debe ser mayor a 0",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const promotion = await this.promotionService.decreaseStock(req.params.id, quantity, user._id || user.id, ip);
      if (!promotion) {
        const response: IErrorResponse = {
          success: false,
          error: "Promoción no encontrada",
          errorCode: "PROMOTION_NOT_FOUND",
          message: "No se encontró una promoción con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: `Stock disminuido exitosamente (-${quantity})`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al disminuir el stock",
        errorCode: "STOCK_DECREASE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para desactivar una promoción
  async deactivatePromotion(req: Request, res: Response): Promise<Response> {
    const user = (req as any).user;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    try {
      const promotion = await this.promotionService.deactivatePromotion(req.params.id, user._id || user.id, ip);
      if (!promotion) {
        const response: IErrorResponse = {
          success: false,
          error: "Promoción no encontrada",
          errorCode: "PROMOTION_NOT_FOUND",
          message: "No se encontró una promoción con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof promotion> = {
        success: true,
        data: promotion,
        message: "Promoción desactivada exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al desactivar la promoción",
        errorCode: "PROMOTION_DEACTIVATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  // Controlador para obtener todas las promociones sin paginación
  async getAllPromotionsNoPagination(req: Request, res: Response): Promise<Response> {
    try {
      const promotions = await this.promotionService.getAllPromotionsSinPage();
      const response: ISuccessResponse<typeof promotions> = {
        success: true,
        data: promotions,
        message: "Promociones obtenidas exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener las promociones",
        errorCode: "PROMOTIONS_GET_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
