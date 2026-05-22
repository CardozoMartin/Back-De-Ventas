import { injectable } from "tsyringe";
import { ClientService } from "../service/Client.services";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class ClientController {
  constructor(private clientService: ClientService) {}

  async createClient(req: Request, res: Response): Promise<Response> {
    try {
      const client = await this.clientService.createClient(req.body);
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente creado exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear el cliente",
        errorCode: "CLIENT_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async getClientById(req: Request, res: Response): Promise<Response> {
    try {
      const client = await this.clientService.getClientById(req.params.id);
      if (!client) {
        const response: IErrorResponse = {
          success: false,
          error: "Cliente no encontrado",
          errorCode: "CLIENT_NOT_FOUND",
          message: "No se encontró un cliente con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente obtenido exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener el cliente",
        errorCode: "CLIENT_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async getAllClients(req: Request, res: Response): Promise<Response> {
    try {
      const clients = await this.clientService.getAllClients();
      const response: ISuccessResponse<typeof clients> = {
        success: true,
        data: clients,
        message: "Clientes obtenidos exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los clientes",
        errorCode: "CLIENTS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async updateClient(req: Request, res: Response): Promise<Response> {
    try {
      const client = await this.clientService.updateClient(req.params.id, req.body);
      if (!client) {
        const response: IErrorResponse = {
          success: false,
          error: "Cliente no encontrado",
          errorCode: "CLIENT_NOT_FOUND",
          message: "No se encontró un cliente con el ID proporcionado para actualizar",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Cliente actualizado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al actualizar el cliente",
        errorCode: "CLIENT_UPDATE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async deleteClient(req: Request, res: Response): Promise<Response> {
    try {
      await this.clientService.deleteClient(req.params.id);
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Cliente eliminado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al eliminar el cliente",
        errorCode: "CLIENT_DELETE_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  async payDebt(req: Request, res: Response): Promise<Response> {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        const response: IErrorResponse = {
          success: false,
          error: "Monto inválido",
          errorCode: "INVALID_AMOUNT",
          message: "El monto a pagar debe ser mayor a cero",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const client = await this.clientService.payDebt(req.params.id, amount);
      if (!client) {
        const response: IErrorResponse = {
          success: false,
          error: "Cliente no encontrado",
          errorCode: "CLIENT_NOT_FOUND",
          message: "No se encontró el cliente para procesar el pago",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof client> = {
        success: true,
        data: client,
        message: "Pago de deuda registrado exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al registrar el pago",
        errorCode: "DEBT_PAYMENT_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
