export type UserRole = 'USER' | 'PROJECT_MANAGER' | 'ADMIN';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspace {
  _id: string;
  name: string;
  description?: string;
  owner: IUser;
  members: IUser[];
  memberDetails?: IWorkspaceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface IWorkspaceMember {
  _id: string;
  workspace: string;
  user: IUser;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface IProject {
  _id: string;
  workspace: string | { _id: string; name: string };
  name: string;
  description?: string;
  key: string;
  owner: IUser;
  members: IUser[];
  status: ProjectStatus;
  startDate?: string;
  dueDate?: string;
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface IAttachment {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: IUser;
  uploadedAt: string;
}

export interface ITimeEntry {
  id: string;
  user: IUser;
  description?: string;
  durationMinutes: number;
  startTime?: string;
  endTime?: string;
  createdAt: string;
}

export interface ITask {
  _id: string;
  project: IProject | string;
  workspace: string;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: IUser;
  reporter: IUser;
  labels: string[];
  dueDate?: string;
  startDate?: string;
  estimatedHours: number;
  actualHours: number;
  position: number;
  subtasks: ISubtask[];
  attachments: IAttachment[];
  watchers: IUser[];
  timeEntries: ITimeEntry[];
  recurrence?: {
    type: RecurrenceType;
    interval: number;
    nextRunDate?: string;
  };
  isArchived: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  task: string;
  author: IUser;
  content: string;
  mentions: IUser[];
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  type:
    | 'TASK_ASSIGNED'
    | 'TASK_STATUS_CHANGED'
    | 'MENTION'
    | 'COMMENT'
    | 'PROJECT_INVITE'
    | 'TASK_DUE_SOON'
    | 'TASK_OVERDUE'
    | 'SYSTEM';
  title: string;
  message: string;
  relatedTask?: { _id: string; title: string };
  relatedProject?: { _id: string; name: string; key: string };
  isRead: boolean;
  createdAt: string;
}

export interface IActivity {
  _id: string;
  workspace: string;
  project?: { _id: string; name: string; key: string };
  task?: { _id: string; title: string; taskNumber: number };
  actor: IUser;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code?: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}