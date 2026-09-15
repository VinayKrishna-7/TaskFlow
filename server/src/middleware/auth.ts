import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole, WorkspaceRole } from '../types';
import { verifyAccessToken } from '../utils/token';
import { AppError } from '../utils/appError';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Project } from '../models/Project';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw AppError.unauthorized('No authentication token provided');
    }

    const payload = verifyAccessToken(token);
    const userDoc = await User.findById(payload.id).lean();

    if (!userDoc) {
      throw AppError.unauthorized('User associated with token no longer exists');
    }

    if (!userDoc.isActive) {
      throw AppError.forbidden('User account has been disabled. Please contact an administrator.');
    }

    req.user = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      username: userDoc.username,
      role: userDoc.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      return next(AppError.unauthorized());
    }

    if (user.role === 'ADMIN') {
      return next();
    }

    if (!roles.includes(user.role)) {
      return next(
        AppError.forbidden(`Access denied. Requires one of the following roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
};

export const checkWorkspaceMember = (requiredRoles?: WorkspaceRole[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) throw AppError.unauthorized();

      if (user.role === 'ADMIN') return next();

      const workspaceId =
        req.params.workspaceId ||
        req.params.id ||
        req.body.workspace ||
        req.body.workspaceId ||
        req.query.workspaceId ||
        req.query.workspace;

      if (!workspaceId) {
        throw AppError.badRequest('Workspace ID is required');
      }

      let membership: any = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: user.id,
      }).lean();

      if (!membership) {
        // Fallback: Check if user is the owner or member in Workspace collection
        const workspace = await Workspace.findById(workspaceId).lean();
        if (workspace) {
          const isOwner = workspace.owner.toString() === user.id;
          const isArrayMember =
            workspace.members && workspace.members.some((m: any) => m.toString() === user.id);

          if (isOwner || isArrayMember) {
            try {
              membership = await WorkspaceMember.create({
                workspace: workspaceId,
                user: user.id,
                role: isOwner ? 'OWNER' : 'MEMBER',
              });
            } catch {
              membership = { role: isOwner ? 'OWNER' : 'MEMBER' };
            }
          }
        }
      }

      if (!membership) {
        throw AppError.forbidden('You are not a member of this workspace');
      }

      if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.includes(membership.role)) {
          throw AppError.forbidden(
            `Workspace permission denied. Required workspace role: ${requiredRoles.join(', ')}`
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkProjectAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) throw AppError.unauthorized();

    if (user.role === 'ADMIN') return next();

    const projectId = req.params.projectId || req.body.project || req.params.id;
    if (!projectId) {
      throw AppError.badRequest('Project ID is required');
    }

    const project = await Project.findById(projectId).lean();
    if (!project) {
      throw AppError.notFound('Project not found');
    }

    const userId = user.id;
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some((m) => m.toString() === userId);

    if (!isOwner && !isMember) {
      const membership = await WorkspaceMember.findOne({
        workspace: project.workspace,
        user: userId,
      }).lean();

      if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
        throw AppError.forbidden('You do not have permission to access this project');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
