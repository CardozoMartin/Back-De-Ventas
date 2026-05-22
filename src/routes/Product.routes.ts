import 'reflect-metadata';
import { Router } from 'express';
import { ProductController } from '../controllers/Product.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { validate } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema, stockChangeSchema } from '../middlewares/schemas';

const productRouter = Router();
const productController = container.resolve(ProductController);

//ruta para crear un producto
productRouter.post('/', verifyToken, validate(createProductSchema), productController.createProduct.bind(productController));

//ruta para obtener todos los productos sin paginacion
productRouter.get('/all', verifyToken, productController.getAllProductsNoPagination.bind(productController));

//ruta para buscar productos por coincidencias
productRouter.get('/search-match/query', verifyToken, productController.searchProducts.bind(productController));

//ruta para obtener todos los productos
productRouter.get('/', verifyToken, productController.getAllProducts.bind(productController));

//ruta para obtener un producto por nombre o código
productRouter.get('/search/:nameOrCode', verifyToken, productController.getOneProductByNameOrCode.bind(productController));
productRouter.get('/:id', verifyToken, productController.getProductById.bind(productController));

//ruta para actualizar un producto
productRouter.put('/:id', verifyToken, validate(updateProductSchema), productController.updateProduct.bind(productController));

//ruta para eliminar un producto
productRouter.delete('/:id', verifyToken, productController.deleteProduct.bind(productController));

//ruta para aumentar stock
productRouter.post('/:id/increase-stock', verifyToken, validate(stockChangeSchema), productController.increaseStock.bind(productController));

//ruta para disminuir stock
productRouter.post('/:id/decrease-stock', verifyToken, validate(stockChangeSchema), productController.decreaseStock.bind(productController));

//ruta para desactivar un producto
productRouter.post('/:id/deactivate', verifyToken, productController.deactivateProduct.bind(productController));

export default productRouter;
