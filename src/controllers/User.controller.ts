import { injectable } from "tsyringe";
import { UserService } from "../service/User.service";
import { ISuccessResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorHandler";
import { catchAsync } from "../utils/catchAsync";

@injectable()
export class UserController {
  constructor(private userService: UserService) {}

  //controlador para crear un usuario
  createUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await this.userService.createUser(req.body);
    const response: ISuccessResponse<typeof user> = {
      success: true,
      data: user,
      message: "Usuario creado exitosamente",
      timestamp: new Date(),
    };
    res.status(201).json(response);
  });

  //controlador para obtener un usuario por id
  getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await this.userService.getUserById(req.params.id);
    if (!user) {
      throw new AppError("No se encontró un usuario con el ID proporcionado", 404, "USER_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof user> = {
      success: true,
      data: user,
      message: "Usuario obtenido exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para obtener todos los usuarios
  getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const users = await this.userService.getAllUsers();
    const response: ISuccessResponse<typeof users> = {
      success: true,
      data: users,
      message: "Usuarios obtenidos exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para actualizar un usuario
  updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    if (!user) {
      throw new AppError("No se encontró un usuario con el ID proporcionado", 404, "USER_NOT_FOUND");
    }
    const response: ISuccessResponse<typeof user> = {
      success: true,
      data: user,
      message: "Usuario actualizado exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para eliminar un usuario
  deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await this.userService.deleteUser(req.params.id);
    const response: ISuccessResponse<null> = {
      success: true,
      data: null,
      message: "Usuario eliminado exitosamente",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });

  //controlador para login
  login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email y contraseña son requeridos", 400, "MISSING_CREDENTIALS");
    }

    const loginData = await this.userService.login({ email, password });
    const response: ISuccessResponse<typeof loginData> = {
      success: true,
      data: loginData,
      message: "Login exitoso",
      timestamp: new Date(),
    };
    res.status(200).json(response);
  });
}
