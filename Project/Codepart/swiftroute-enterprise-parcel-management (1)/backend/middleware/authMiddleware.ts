import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { db } from '../database/connection';
import { sendError } from '../utils/apiResponse';
import { User } from '../../shared/types';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication token missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    const users = db.getTable('users');
    const user = users.find((u) => u.id === decoded.id);

    if (!user) {
      return sendError(res, 'User account no longer exists', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Your account is suspended. Please contact dispatch support.', 403);
    }

    const { password_hash, ...safeUser } = user;
    req.user = safeUser as User;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired session token', 401);
  }
};
