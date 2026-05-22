import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user info from JWT
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'admin' | 'vendedor';
  };
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
     try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Verificar el token (no solo decodificarlo)
        const decoded = jwt.verify(token, secret);

        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        (req as AuthRequest).user = decoded as AuthRequest['user'];
       
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};
