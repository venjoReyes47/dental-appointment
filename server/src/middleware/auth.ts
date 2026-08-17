import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import { User, UserRole } from '../models';

interface AccessTokenPayload extends JwtPayload {
  id: number;
  email: string;
  role: number;
}

export const validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No valid token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), env.JWT_SECRET_KEY) as AccessTokenPayload;
    const user = await User.findOne({
      where: { UserId: decoded.id, IsActive: 1 },
      include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }]
    });
    const roleId = user?.role?.RoleId;
    if (!user || !roleId) {
      res.status(401).json({ success: false, message: 'User is inactive or no longer authorized.' });
      return;
    }

    req.user = { ...decoded, id: user.UserId, email: user.Email, role: roleId };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireRole = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
};
