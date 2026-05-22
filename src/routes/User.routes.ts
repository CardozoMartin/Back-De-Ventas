import 'reflect-metadata';
import { Router } from 'express';
import { UserController } from '../controllers/User.controller';
import { container } from 'tsyringe';
import { verifyToken } from '../middlewares/TokenVerify';
import { requireRole } from '../middlewares/RoleAuthorization';
import { validate } from '../middlewares/validateRequest';
import { loginSchema, createUserSchema, updateUserSchema } from '../middlewares/schemas';
import { asyncHandler } from '../utils/asyncHandler';

const userRouter = Router();
const userController = container.resolve(UserController);

//ruta para login (pública)
userRouter.post('/login', validate(loginSchema), userController.login);
//ruta para crear un usuario (solo admin)
userRouter.post('/', verifyToken, requireRole('admin'), validate(createUserSchema), userController.createUser);
//ruta para obtener un usuario por id
userRouter.get('/:id', verifyToken, userController.getUserById);
//ruta para obtener todos los usuarios
userRouter.get('/', verifyToken, userController.getAllUsers);
//ruta para actualizar un usuario (solo admin)
userRouter.put('/:id', verifyToken, requireRole('admin'), validate(updateUserSchema), userController.updateUser);
//ruta para eliminar un usuario (solo admin)
userRouter.delete('/:id', verifyToken, requireRole('admin'), userController.deleteUser);

export default userRouter;
