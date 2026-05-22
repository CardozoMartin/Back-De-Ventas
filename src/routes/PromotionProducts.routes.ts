import 'reflect-metadata';
import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionProducts.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { validate } from '../middlewares/validateRequest';
import { createPromotionSchema, updatePromotionSchema, stockChangeSchema } from '../middlewares/schemas';

const promotionRouter = Router();
const promotionController = container.resolve(PromotionController);

// Ruta para crear una promoción
promotionRouter.post('/', verifyToken, validate(createPromotionSchema), promotionController.createPromotion.bind(promotionController));

// Ruta para obtener todas las promociones sin paginación
promotionRouter.get('/all', verifyToken, promotionController.getAllPromotionsNoPagination.bind(promotionController));

// Ruta para obtener promociones activas
promotionRouter.get('/active', verifyToken, promotionController.getActivePromotions.bind(promotionController));

// Ruta para obtener todas las promociones
promotionRouter.get('/', verifyToken, promotionController.getAllPromotions.bind(promotionController));

// Ruta para obtener una promoción por ID
promotionRouter.get('/:id', verifyToken, promotionController.getPromotionById.bind(promotionController));

// Ruta para actualizar una promoción
promotionRouter.put('/:id', verifyToken, validate(updatePromotionSchema), promotionController.updatePromotion.bind(promotionController));

// Ruta para eliminar una promoción
promotionRouter.delete('/:id', verifyToken, promotionController.deletePromotion.bind(promotionController));

// Ruta para aumentar stock
promotionRouter.post('/:id/increase-stock', verifyToken, validate(stockChangeSchema), promotionController.increaseStock.bind(promotionController));

// Ruta para disminuir stock
promotionRouter.post('/:id/decrease-stock', verifyToken, validate(stockChangeSchema), promotionController.decreaseStock.bind(promotionController));

// Ruta para desactivar una promoción
promotionRouter.post('/:id/deactivate', verifyToken, promotionController.deactivatePromotion.bind(promotionController));

export default promotionRouter;
