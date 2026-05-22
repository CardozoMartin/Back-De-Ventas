import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Middleware genérico de validación con Zod v4.
 * Valida req.body contra el schema proporcionado.
 * 
 * Uso:
 *   router.post('/', verifyToken, validate(createSaleSchema), controller.create)
 */
export const validate = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue: any) => ({
        field: issue.path?.join('.') || 'unknown',
        message: issue.message,
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Error de validación',
        errorCode: 'VALIDATION_ERROR',
        message: formattedErrors.map((e: any) => `${e.field}: ${e.message}`).join('; '),
        details: formattedErrors,
        timestamp: new Date(),
      });
    }
    
    // Reemplazar req.body con los datos sanitizados
    req.body = result.data;
    next();
  };
};

/**
 * Middleware para validar query params.
 */
export const validateQuery = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue: any) => ({
        field: issue.path?.join('.') || 'unknown',
        message: issue.message,
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Error de validación en parámetros',
        errorCode: 'QUERY_VALIDATION_ERROR',
        message: formattedErrors.map((e: any) => `${e.field}: ${e.message}`).join('; '),
        details: formattedErrors,
        timestamp: new Date(),
      });
    }
    
    next();
  };
};
