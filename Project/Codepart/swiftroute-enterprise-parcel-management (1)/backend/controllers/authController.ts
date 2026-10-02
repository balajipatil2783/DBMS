import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../database/connection';
import { config } from '../config';
import { hashPassword, comparePassword } from '../utils/passwordUtils';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { logActivity } from '../services/activityService';
import { User, UserRole } from '../../shared/types';
import passport from '../config/passport';

export const register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role = 'customer', phone, address } = req.body;

    if (!full_name || !email || !password || !phone) {
      return sendError(res, 'Name, email, password, and phone are required', 422);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, 'Please provide a valid corporate or personal email address', 422);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 422);
    }

    const users = db.getTable('users');
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return sendError(res, 'An account with this email address already exists', 409);
    }

    const validRoles: UserRole[] = ['customer', 'agent', 'admin'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'customer';

    const password_hash = await hashPassword(password);
    const newUser: User & { password_hash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      full_name,
      email: email.toLowerCase(),
      password_hash,
      role: assignedRole,
      phone,
      address: address || '',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('users', newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: newUser.id, full_name: newUser.full_name, role: newUser.role },
      'USER_REGISTERED',
      'user',
      newUser.id,
      `New ${newUser.role} registered: ${newUser.full_name} (${newUser.email})`
    );

    const { password_hash: _, ...safeUser } = newUser;
    return sendSuccess(res, { token, user: safeUser }, 'Account successfully registered', 201);
  } catch (error: any) {
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const users = db.getTable('users');
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return sendError(res, 'Invalid credentials. Please verify your email and password.', 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'This account is suspended. Please contact dispatch administration.', 403);
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials. Please verify your email and password.', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: user.id, full_name: user.full_name, role: user.role },
      'USER_LOGIN',
      'user',
      user.id,
      `User ${user.full_name} authenticated successfully`
    );

    const { password_hash: _, ...safeUser } = user;
    return sendSuccess(res, { token, user: safeUser }, 'Authenticated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Login failed', 500);
  }
};

// Google OAuth Callback Handler
export const googleCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.redirect('http://localhost:5173?error=authentication_failed');
    }

    const user = req.user as User;
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    logActivity(
      { id: user.id, full_name: user.full_name, role: user.role },
      'GOOGLE_OAUTH_LOGIN',
      'user',
      user.id,
      `User ${user.full_name} authenticated via Google OAuth`
    );

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173?token=${token}`);
  } catch (error: any) {
    res.redirect('http://localhost:5173?error=server_error');
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return sendError(res, 'Unauthorized', 401);
  }
  return sendSuccess(res, req.user);
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { full_name, phone, address, password } = req.body;
    const updates: Partial<User & { password_hash: string }> = {};

    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (password && password.length >= 6) {
      updates.password_hash = await hashPassword(password);
    }

    const updated = db.update('users', req.user.id, updates);
    if (!updated) return sendError(res, 'Failed to update profile', 404);

    const { password_hash, ...safeUser } = updated;
    logActivity(safeUser, 'PROFILE_UPDATED', 'user', safeUser.id, `User ${safeUser.full_name} updated their profile info.`);

    return sendSuccess(res, safeUser, 'Profile successfully updated');
  } catch (error: any) {
    return sendError(res, error.message || 'Update failed', 500);
  }
};
