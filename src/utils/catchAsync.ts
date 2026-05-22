import { Request, Response, NextFunction } from 'express';

/**
 * Envoltorio para funciones asíncronas en controladores.
 * Captura automáticamente las excepciones y las pasa al middleware de manejo de errores (next),
 * eliminando la necesidad de bloques try/catch repetitivos.
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
