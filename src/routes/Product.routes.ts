import 'reflect-metadata';
import { Router } from 'express';
import { ProductController } from '../controllers/Product.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokeVerify';

const productRouter = Router();
const productController = container.resolve(ProductController);

//ruta para crear un producto
productRouter.post('/',verifyToken, productController.createProduct.bind(productController));

//ruta para obtener todos los productos sin paginacion
productRouter.get('/all', productController.getAllProductsNoPagination.bind(productController));

//ruta para obtener todos los productos
productRouter.get('/', productController.getAllProducts.bind(productController));

//ruta para obtener un producto por id
productRouter.get('/:id', productController.getProductById.bind(productController));

//ruta para actualizar un producto
productRouter.put('/:id', verifyToken, productController.updateProduct.bind(productController));

//ruta para eliminar un producto
productRouter.delete('/:id', verifyToken, productController.deleteProduct.bind(productController));

//ruta para aumentar stock
productRouter.post('/:id/increase-stock', verifyToken, productController.increaseStock.bind(productController));

//ruta para disminuir stock
productRouter.post('/:id/decrease-stock', verifyToken, productController.decreaseStock.bind(productController));

//ruta para desactivar un producto
productRouter.post('/:id/deactivate', verifyToken, productController.deactivateProduct.bind(productController));

export default productRouter;
