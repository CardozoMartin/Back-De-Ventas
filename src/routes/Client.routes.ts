import 'reflect-metadata';
import { Router } from 'express';
import { ClientController } from '../controllers/Client.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { validate } from '../middlewares/validateRequest';
import { createClientSchema, updateClientSchema, payDebtSchema } from '../middlewares/schemas';

const clientRouter = Router();
const clientController = container.resolve(ClientController);

// Ruta para obtener todos los clientes
clientRouter.get('/', verifyToken, clientController.getAllClients.bind(clientController));

// Ruta para obtener un cliente por id
clientRouter.get('/:id', verifyToken, clientController.getClientById.bind(clientController));

// Ruta para crear un cliente
clientRouter.post('/', verifyToken, validate(createClientSchema), clientController.createClient.bind(clientController));

// Ruta para actualizar un cliente
clientRouter.put('/:id', verifyToken, validate(updateClientSchema), clientController.updateClient.bind(clientController));

// Ruta para eliminar un cliente (soft delete)
clientRouter.delete('/:id', verifyToken, clientController.deleteClient.bind(clientController));

// Ruta para registrar el pago de una deuda
clientRouter.post('/:id/pay', verifyToken, validate(payDebtSchema), clientController.payDebt.bind(clientController));

export default clientRouter;
