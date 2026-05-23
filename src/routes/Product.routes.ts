import 'reflect-metadata';
import { Router } from 'express';
import { ProductController } from '../controllers/Product.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { validate } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema, stockChangeSchema } from '../middlewares/schemas';
import { asyncHandler } from '../utils/asyncHandler';

const productRouter = Router();
const productController = container.resolve(ProductController);

//ruta para crear un producto
productRouter.post('/', verifyToken, validate(createProductSchema), productController.createProduct);

//ruta para obtener todos los productos sin paginacion
productRouter.get('/all', verifyToken, productController.getAllProductsNoPagination);

//ruta para ejecutar mantenimiento manual
productRouter.post('/maintenance/run', verifyToken, productController.runMaintenance);

//ruta para buscar productos por coincidencias
productRouter.get('/search-match/query', verifyToken, productController.searchProducts);

//ruta para obtener todos los productos
productRouter.get('/', verifyToken, productController.getAllProducts);

//ruta para obtener un producto por nombre o código
productRouter.get('/search/:nameOrCode', verifyToken, productController.getOneProductByNameOrCode);
productRouter.get('/:id', verifyToken, productController.getProductById);

//ruta para actualizar un producto
productRouter.put('/:id', verifyToken, validate(updateProductSchema), productController.updateProduct);

//ruta para eliminar un producto
productRouter.delete('/:id', verifyToken, productController.deleteProduct);

//ruta para aumentar stock
productRouter.post('/:id/increase-stock', verifyToken, validate(stockChangeSchema), productController.increaseStock);

//ruta para disminuir stock
productRouter.post('/:id/decrease-stock', verifyToken, validate(stockChangeSchema), productController.decreaseStock);

//ruta para desactivar un producto
productRouter.post('/:id/deactivate', verifyToken, productController.deactivateProduct);

export default productRouter;
