import { injectable } from "tsyringe";
import { AuditService } from "../service/Audit.service";
import { AuditAction, AuditEntity } from "../models/Audit.model";
import { ISuccessResponse, IErrorResponse } from "../types/IResponse.types";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../middlewares/errorHandler";

@injectable()
export class AuditController {
  constructor(private auditService: AuditService) { }

  //controlador para crear un registro de auditoría
  createAudit = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const audit = await this.auditService.createAudit(req.body);
      const response: ISuccessResponse<typeof audit> = {
        success: true,
        data: audit,
        message: "Registro de auditoría creado exitosamente",
        timestamp: new Date(),
      };
      res.status(201).json(response);
  });

  //controlador para obtener un registro de auditoría por id
  getAuditById = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const audit = await this.auditService.getAuditById(req.params.id);
      if (!audit) {
        throw new AppError("No se encontró un registro de auditoría con el ID proporcionado", 404, "AUDIT_NOT_FOUND");
      }
      const response: ISuccessResponse<typeof audit> = {
        success: true,
        data: audit,
        message: "Registro de auditoría obtenido exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener todos los registros de auditoría
  getAllAudits = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const audits = await this.auditService.getAllAudits();
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: "Registros de auditoría obtenidos exitosamente",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener registros de auditoría por usuario
  getAuditsByUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { userId } = req.params;
      const audits = await this.auditService.getAuditsByUser(userId);
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: `Registros de auditoría del usuario obtenidos exitosamente`,
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para obtener registros de auditoría por entidad
  getAuditsByEntity = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { entity, entityId } = req.query;
      if (!entity) {
        throw new AppError("El parámetro 'entity' es requerido", 400, "MISSING_PARAMETER");
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
      res.status(200).json(response);
  });

  //controlador para obtener registros de auditoría por acción
  getAuditsByAction = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const { action } = req.query;
      if (!action) {
        throw new AppError("El parámetro 'action' es requerido", 400, "MISSING_PARAMETER");
      }
      const audits = await this.auditService.getAuditsByAction(action as AuditAction);
      const response: ISuccessResponse<typeof audits> = {
        success: true,
        data: audits,
        message: `Registros de auditoría con acción '${action}' obtenidos exitosamente`,
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });

  //controlador para eliminar todos los registros de auditoría
  deleteAllAudits = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      await this.auditService.deleteAllAudits();
      const response: ISuccessResponse<null> = {
        success: true,
        data: null,
        message: "Todos los registros de auditoría han sido eliminados",
        timestamp: new Date(),
      };
      res.status(200).json(response);
  });
}
