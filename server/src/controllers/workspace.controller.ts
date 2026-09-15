import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { WorkspaceService } from '../services/workspace.service';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class WorkspaceController {
  static async createWorkspace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { name, description } = req.body;
      const workspace = await WorkspaceService.createWorkspace(req.user.id, name, description);
      ApiResponse.created(res, 'Workspace created successfully', { workspace });
    } catch (error) {
      next(error);
    }
  }

  static async getUserWorkspaces(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const workspaces = await WorkspaceService.getUserWorkspaces(req.user.id);
      ApiResponse.success(res, 'User workspaces retrieved', { workspaces });
    } catch (error) {
      next(error);
    }
  }

  static async getWorkspaceById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await WorkspaceService.getWorkspaceById(req.params.id);
      ApiResponse.success(res, 'Workspace details retrieved', { workspace });
    } catch (error) {
      next(error);
    }
  }

  static async updateWorkspace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description } = req.body;
      const workspace = await WorkspaceService.updateWorkspace(req.params.id, name, description);
      ApiResponse.success(res, 'Workspace updated successfully', { workspace });
    } catch (error) {
      next(error);
    }
  }

  static async deleteWorkspace(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await WorkspaceService.deleteWorkspace(req.params.id);
      ApiResponse.success(res, 'Workspace deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { emailOrUsername, role } = req.body;
      const membership = await WorkspaceService.inviteMember(
        req.params.id,
        emailOrUsername,
        role,
        req.user.id
      );
      ApiResponse.created(res, 'Member added to workspace', { membership });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await WorkspaceService.removeMember(req.params.id, req.params.userId, req.user.id);
      ApiResponse.success(res, 'Member removed from workspace');
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      const membership = await WorkspaceService.updateMemberRole(
        req.params.id,
        req.params.userId,
        role
      );
      ApiResponse.success(res, 'Member role updated successfully', { membership });
    } catch (error) {
      next(error);
    }
  }
}