import 'reflect-metadata';
import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { requireRole } from '../middlewares/RoleAuthorization';
import { validate } from '../middlewares/validateRequest';
import { loginSchema, createUserSchema, updateUserSchema } from '../middlewares/schemas';

const userRouter = Router();
const userController = container.resolve(UserController);

//ruta para login (pública)
userRouter.post('/login', validate(loginSchema), userController.login.bind(userController));
//ruta para crear un usuario (solo admin)
userRouter.post('/', verifyToken, requireRole('admin'), validate(createUserSchema), userController.createUser.bind(userController));
//ruta para obtener un usuario por id
userRouter.get('/:id', verifyToken, userController.getUserById.bind(userController));
//ruta para obtener todos los usuarios
userRouter.get('/', verifyToken, userController.getAllUsers.bind(userController));
//ruta para actualizar un usuario (solo admin)
userRouter.put('/:id', verifyToken, requireRole('admin'), validate(updateUserSchema), userController.updateUser.bind(userController));
//ruta para eliminar un usuario (solo admin)
userRouter.delete('/:id', verifyToken, requireRole('admin'), userController.deleteUser.bind(userController));

export default userRouter;