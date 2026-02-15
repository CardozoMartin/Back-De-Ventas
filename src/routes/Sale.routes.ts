import 'reflect-metadata';
import { Router } from 'express';
import { SaleController } from '../controllers/Sale.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokeVerify';

const saleRouter = Router();
const saleController = container.resolve(SaleController);

//ruta para crear unaverifyToken, saleController.createSale.bind(saleController));
saleRouter.post('/', verifyToken, saleController.createSale.bind(saleController));
//ruta para obtener una venta por id
saleRouter.get('/:id', saleController.getSaleById.bind(saleController));

//ruta para obtener todas las ventas
saleRouter.get('/', saleController.getAllSales.bind(saleController));

//ruta para obtener ventas por vendedor
saleRouter.get('/seller/:sellerId', saleController.getSalesBySeller.bind(saleController));

//ruta para obtener ventas por caja registradora
saleRouter.get('/cash-register/:cashRegisterId', verifyToken, saleController.getSalesByCashRegister.bind(saleController));

//ruta para actualizar una venta
saleRouter.put('/:id', verifyToken, saleController.updateSale.bind(saleController));

//ruta para cancelar una venta
saleRouter.post('/:id/cancel', verifyToken, saleController.cancelSale.bind(saleController));

//ruta para completar una venta pendiente
saleRouter.post('/:id/complete', verifyToken, saleController.completeSale.bind(saleController));

export default saleRouter;
