import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'USER' | 'PROJECT_MANAGER' | 'ADMIN';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'MENTION'
  | 'COMMENT'
  | 'PROJECT_INVITE'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'SYSTEM';

export interface IUserPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}
