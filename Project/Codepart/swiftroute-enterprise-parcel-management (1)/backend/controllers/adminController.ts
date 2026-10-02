import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../database/connection';
import { sendSuccess, sendError } from '../utils/apiResponse';
import * as reportService from '../services/reportService';
import * as activityService from '../services/activityService';
import { hashPassword } from '../utils/passwordUtils';
import { UserRole, User } from '../../shared/types';

export const getDashboardStatsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = reportService.getDashboardStats();
    return sendSuccess(res, stats);
  } catch (err: any) {
    return sendError(res, err.message || 'Error compiling dashboard statistics', 500);
  }
};

export const getReportsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const monthlyDeliveries = reportService.getMonthlyDeliveryReports();
    const revenueReports = reportService.getRevenueReports();
    return sendSuccess(res, { monthlyDeliveries, revenueReports });
  } catch (err: any) {
    return sendError(res, err.message || 'Error generating reports', 500);
  }
};

export const getUsersHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.query;
    let users = db.getTable('users');

    if (role && role !== 'all') {
      users = users.filter((u) => u.role === role);
    }

    const safeUsers = users.map(({ password_hash, ...rest }) => rest);
    return sendSuccess(res, safeUsers, 'Users fetched', 200, { total: safeUsers.length });
  } catch (err: any) {
    return sendError(res, err.message || 'Error fetching users', 500);
  }
};

export const createAgentHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, email, password, phone, address } = req.body;

    if (!full_name || !email || !password || !phone) {
      return sendError(res, 'Name, email, password, and phone are required for agent onboarding', 422);
    }

    const existing = db.getTable('users').find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const password_hash = await hashPassword(password);
    const newAgent: User & { password_hash: string } = {
      id: `usr_agent_${Date.now().toString().slice(-4)}`,
      full_name,
      email: email.toLowerCase(),
      password_hash,
      role: 'agent',
      phone,
      address: address || 'Fleet Depot',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.insert('users', newAgent);

    activityService.logActivity(
      req.user || null,
      'AGENT_CREATED',
      'user',
      newAgent.id,
      `Administrator onboarded new courier agent: ${newAgent.full_name} (${newAgent.email})`
    );

    const { password_hash: _, ...safeAgent } = newAgent;
    return sendSuccess(res, safeAgent, 'Courier agent onboarded successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to onboard agent', 500);
  }
};

export const updateUserStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'suspended'].includes(status)) {
      return sendError(res, 'Valid status (active or suspended) is required', 400);
    }

    const updated = db.update('users', id, { status });
    if (!updated) {
      return sendError(res, 'User record not found', 404);
    }

    activityService.logActivity(
      req.user || null,
      'USER_STATUS_CHANGE',
      'user',
      id,
      `User ${updated.full_name} status updated to ${status}`
    );

    const { password_hash: _, ...safeUser } = updated;
    return sendSuccess(res, safeUser, `User status updated to ${status}`);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update user status', 500);
  }
};

export const getActivityLogsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = activityService.getActivityLogs(100);
    return sendSuccess(res, logs);
  } catch (err: any) {
    return sendError(res, err.message || 'Error fetching activity logs', 500);
  }
};

export const getSettingsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = db.getTable('system_settings');
    return sendSuccess(res, settings);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch settings', 500);
  }
};

export const updateSettingsHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = db.update('system_settings', '', updates);

    activityService.logActivity(
      req.user || null,
      'SETTINGS_UPDATED',
      'system',
      'system_settings',
      'System logistics parameters and rates updated by admin'
    );

    return sendSuccess(res, updated, 'System settings updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update settings', 500);
  }
};
