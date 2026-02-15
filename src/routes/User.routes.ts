import 'reflect-metadata';
import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { container } from 'tsyringe';

const userRouter = Router();
const userController = container.resolve(UserController);

//ruta para login
userRouter.post('/login', userController.login.bind(userController));
//ruta para crear un usuario
userRouter.post('/', userController.createUser.bind(userController));
//ruta para obtener un usuario por id
userRouter.get('/:id', userController.getUserById.bind(userController));
//ruta para obtener todos los usuarios
userRouter.get('/', userController.getAllUsers.bind(userController));
//ruta para actualizar un usuario
userRouter.put('/:id', userController.updateUser.bind(userController));
//ruta para eliminar un usuario
userRouter.delete('/:id', userController.deleteUser.bind(userController));

export default userRouter;