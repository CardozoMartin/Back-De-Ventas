import { Request, Response, NextFunction } from 'express';
import { IErrorResponse } from '../types/IResponse.types';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode: number, errorCode: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let response: IErrorResponse = {
    success: false,
    error: 'Error interno del servidor',
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: err.message || 'Error desconocido',
    timestamp: new Date(),
  };

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    response.error = 'Error de aplicación';
    response.errorCode = err.errorCode;
    if (err.details) {
      response.message += ` - Detalles: ${JSON.stringify(err.details)}`;
    }
  }

  // Errores de Mongoose/MongoDB específicos (ejemplo)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.error = 'Error de validación de base de datos';
    response.errorCode = 'DB_VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    response.error = 'ID inválido';
    response.errorCode = 'INVALID_ID';
  }

  console.error(`[ERROR] ${statusCode} - ${response.errorCode}: ${err.message}`);

  return res.status(statusCode).json(response);
};
