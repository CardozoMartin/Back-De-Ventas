import 'reflect-metadata';
import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionProducts.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokeVerify';

const promotionRouter = Router();
const promotionController = container.resolve(PromotionController);

// Ruta para crear una promoción
promotionRouter.post('/', verifyToken, promotionController.createPromotion.bind(promotionController));

// Ruta para obtener todas las promociones sin paginación
promotionRouter.get('/all', promotionController.getAllPromotionsNoPagination.bind(promotionController));

// Ruta para obtener promociones activas
promotionRouter.get('/active', promotionController.getActivePromotions.bind(promotionController));

// Ruta para obtener todas las promociones
promotionRouter.get('/', promotionController.getAllPromotions.bind(promotionController));

// Ruta para obtener una promoción por ID
promotionRouter.get('/:id', promotionController.getPromotionById.bind(promotionController));

// Ruta para actualizar una promoción
promotionRouter.put('/:id', verifyToken, promotionController.updatePromotion.bind(promotionController));

// Ruta para eliminar una promoción
promotionRouter.delete('/:id', verifyToken, promotionController.deletePromotion.bind(promotionController));

// Ruta para aumentar stock
promotionRouter.post('/:id/increase-stock', verifyToken, promotionController.increaseStock.bind(promotionController));

// Ruta para disminuir stock
promotionRouter.post('/:id/decrease-stock', verifyToken, promotionController.decreaseStock.bind(promotionController));

// Ruta para desactivar una promoción
promotionRouter.post('/:id/deactivate', verifyToken, promotionController.deactivatePromotion.bind(promotionController));

export default promotionRouter;
