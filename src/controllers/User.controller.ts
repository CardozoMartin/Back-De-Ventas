import { injectable } from "tsyringe";
import { UserService } from "../service/User.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class UserController {
  constructor(private userService: UserService) {}

  //controlador para crear un usuario
  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.createUser(req.body);
      const response: ISuccessResponse<typeof user> = {
        success: true,
        data: user,
        message: "Usuario creado exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear el usuario",
        errorCode: "USER_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
  //controlador para obtener un usuario por id
  async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        const response: IErrorResponse = {
          success: false,
          error: "Usuario no encontrado",
          errorCode: "USER_NOT_FOUND",
          message: "No se encontró un usuario con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof user> = {
        success: true,
        data: user,
        message: "Usuario obtenido exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener el usuario",
        errorCode: "USER_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
  //controlador para obtener todos los usuarios
  async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await this.userService.getAllUsers();
      const response: ISuccessResponse<typeof users> = {
        success: true,
        data: users,
        message: "Usuarios obtenidos exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los usuarios",
        errorCode: "USERS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
  //controlador para actualizar un usuario
  async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (!user) {
        const response: IErrorResponse = {
          success: false,
          error: "Usuario no encontrado",
          errorCode: "USER_NOT_FOUND",
          message: "No se encontró un usuario con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof user> = {
        success: true,
        data: user,
        message: "Usuario actualizado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al actualizar el usuario",
        errorCode: "USER_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
  //controlador para eliminar un usuario
  async deleteUser(req: Request, res: Response): Promise<Response> {
    try {
      await this.userService.deleteUser(req.params.id);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Usuario eliminado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al eliminar el usuario",
        errorCode: "USER_DELETION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
