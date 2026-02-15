import { injectable } from "tsyringe";
import { AuditService } from "../service/Audit.services";
import { AuditAction, AuditEntity } from "../models/Audit.model";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response } from "express";

@injectable()
export class AuditController {
  constructor(private auditService: AuditService) { }

  //controlador para crear un registro de auditoría
  async createAudit(req: Request, res: Response): Promise<Response> {
    try {
      const audit = await this.auditService.createAudit(req.body);
      const response: ISuccessResponse<typeof audit> = {
        success: true,
        data: audit,
        message: "Registro de auditoría creado exitosamente",
        timestamp: new Date(),
      };
      return res.status(201).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al crear el registro de auditoría",
        errorCode: "AUDIT_CREATION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener un registro de auditoría por id
  async getAuditById(req: Request, res: Response): Promise<Response> {
    try {
      const audit = await this.auditService.getAuditById(req.params.id);
      if (!audit) {
        const response: IErrorResponse = {
          success: false,
          error: "Registro de auditoría no encontrado",
          errorCode: "AUDIT_NOT_FOUND",
          message: "No se encontró un registro de auditoría con el ID proporcionado",
          timestamp: new Date(),
        };
        return res.status(404).json(response);
      }
      const response: ISuccessResponse<typeof audit> = {
        success: true,
        data: audit,
        message: "Registro de auditoría obtenido exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener el registro de auditoría",
        errorCode: "AUDIT_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener todos los registros de auditoría
  async getAllAudits(req: Request, res: Response): Promise<Response> {
    try {
      const audits = await this.auditService.getAllAudits();
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: "Registros de auditoría obtenidos exitosamente",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los registros de auditoría",
        errorCode: "AUDITS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener registros de auditoría por usuario
  async getAuditsByUser(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      const audits = await this.auditService.getAuditsByUser(userId);
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: `Registros de auditoría del usuario obtenidos exitosamente`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los registros de auditoría del usuario",
        errorCode: "USER_AUDITS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener registros de auditoría por entidad
  async getAuditsByEntity(req: Request, res: Response): Promise<Response> {
    try {
      const { entity, entityId } = req.query;
      if (!entity) {
        const response: IErrorResponse = {
          success: false,
          error: "Parámetro faltante",
          errorCode: "MISSING_PARAMETER",
          message: "El parámetro 'entity' es requerido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const audits = await this.auditService.getAuditsByEntity(
        entity as AuditEntity,
        entityId as string
      );
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: `Registros de auditoría de ${entity} obtenidos exitosamente`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los registros de auditoría por entidad",
        errorCode: "ENTITY_AUDITS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para obtener registros de auditoría por acción
  async getAuditsByAction(req: Request, res: Response): Promise<Response> {
    try {
      const { action } = req.query;
      if (!action) {
        const response: IErrorResponse = {
          success: false,
          error: "Parámetro faltante",
          errorCode: "MISSING_PARAMETER",
          message: "El parámetro 'action' es requerido",
          timestamp: new Date(),
        };
        return res.status(400).json(response);
      }
      const audits = await this.auditService.getAuditsByAction(action as AuditAction);
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: `Registros de auditoría con acción '${action}' obtenidos exitosamente`,
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al obtener los registros de auditoría por acción",
        errorCode: "ACTION_AUDITS_RETRIEVAL_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }

  //controlador para eliminar todos los registros de auditoría
  async deleteAllAudits(req: Request, res: Response): Promise<Response> {
    try {
      await this.auditService.deleteAllAudits();
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Todos los registros de auditoría han sido eliminados",
        timestamp: new Date(),
      };
      return res.status(200).json(response);
    } catch (error) {
      const response: IErrorResponse = {
        success: false,
        error: "Error al eliminar los registros de auditoría",
        errorCode: "AUDITS_DELETION_ERROR",
        message: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date(),
      };
      return res.status(500).json(response);
    }
  }
}
