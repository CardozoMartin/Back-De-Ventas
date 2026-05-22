import { Response, NextFunction } from 'express';
import { AuthRequest } from './TokenVerify';

/**
 * Middleware factory que restringe acceso a roles específicos.
 * Debe usarse DESPUÉS del middleware verifyToken.
 * 
 * @param allowedRoles - Roles que pueden acceder a la ruta
 * @returns Middleware de Express
 * 
 * Uso:
 *   router.delete('/:id', verifyToken, requireRole('admin'), controller.delete)
 */
export const requireRole = (...allowedRoles: Array<'admin' | 'vendedor'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ 
        message: 'No autorizado: no se encontró información de usuario' 
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Acceso denegado: se requiere rol ${allowedRoles.join(' o ')}` 
      });
    }

    next();
  };
};
