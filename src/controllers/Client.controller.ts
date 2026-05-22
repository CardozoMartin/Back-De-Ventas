import { injectable } from "tsyringe";
import { ClientService } from "../service/Client.service";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class ClientController {
  constructor(private clientService: ClientService) {}

  createClient = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const client = await this.clientService.createClient(req.body);
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente creado exitosamente",
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  getClientById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const client = await this.clientService.getClientById(req.params.id);
      if (!client) {
        throw new AppError("No se encontró un cliente con el ID proporcionado", 404, "CLIENT_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente obtenido exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  getAllClients = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const clients = await this.clientService.getAllClients();
      const response: ISuccessResponse<typeof clients> = {
        success: true,
        data: clients,
        message: "Clientes obtenidos exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  updateClient = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const client = await this.clientService.updateClient(req.params.id, req.body);
      if (!client) {
        throw new AppError("No se encontró un cliente con el ID proporcionado para actualizar", 404, "CLIENT_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente actualizado exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  deleteClient = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await this.clientService.deleteClient(req.params.id);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Cliente eliminado exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  payDebt = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        throw new AppError("El monto a pagar debe ser mayor a cero", 400, "INVALID_AMOUNT");
      }
      const client = await this.clientService.payDebt(req.params.id, amount);
      if (!client) {
        throw new AppError("No se encontró el cliente para procesar el pago", 404, "CLIENT_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Pago de deuda registrado exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
