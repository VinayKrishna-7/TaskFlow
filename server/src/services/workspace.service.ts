import { Workspace, IWorkspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { WorkspaceRole } from '../types';
import { ActivityService } from './activity.service';

export class WorkspaceService {
  static async createWorkspace(userId: string, name: string, description?: string): Promise<IWorkspace> {
    const workspace = await Workspace.create({
      name,
      description,
      owner: userId,
      members: [userId],
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: userId,
      role: 'OWNER',
    });

    await ActivityService.log({
      workspace: workspace._id.toString(),
      actor: userId,
      action: 'CREATED_WORKSPACE',
      metadata: { workspaceName: name },
    });

    return workspace;
  }

  static async getUserWorkspaces(userId: string): Promise<any[]> {
    const memberships = await WorkspaceMember.find({ user: userId }).select('workspace').lean();
    const workspaceIds = memberships.map((m) => m.workspace);

    return Workspace.find({
      $or: [
        { _id: { $in: workspaceIds } },
        { owner: userId },
        { members: userId },
      ],
    })
      .populate('owner', 'name username email avatar')
      .sort({ updatedAt: -1 })
      .lean();
  }

  static async getWorkspaceById(workspaceId: string): Promise<any> {
    const workspace = await Workspace.findById(workspaceId)
      .populate('owner', 'name username email avatar')
      .populate('members', 'name username email avatar role')
      .lean();

    if (!workspace) throw AppError.notFound('Workspace not found');

    let members = await WorkspaceMember.find({ workspace: workspaceId })
      .populate('user', 'name username email avatar role')
      .lean();

    // Auto-heal: Ensure owner has a WorkspaceMember record
    if (workspace.owner) {
      const ownerId = (workspace.owner._id || workspace.owner).toString();
      const hasOwner = members.some(
        (m: any) => m.user && (m.user._id?.toString() === ownerId || m.user.toString() === ownerId)
      );
      if (!hasOwner) {
        try {
          await WorkspaceMember.findOneAndUpdate(
            { workspace: workspaceId, user: ownerId },
            { workspace: workspaceId, user: ownerId, role: 'OWNER' },
            { upsert: true, new: true }
          );
        } catch {
          // ignore duplicate key or concurrent write
        }
      }
    }

    // Auto-heal: Ensure members listed in workspace.members array have WorkspaceMember records
    if (workspace.members && Array.isArray(workspace.members)) {
      for (const mem of workspace.members) {
        const memId = (mem._id || mem).toString();
        const hasMem = members.some(
          (m: any) => m.user && (m.user._id?.toString() === memId || m.user.toString() === memId)
        );
        if (!hasMem) {
          try {
            const isOwner = workspace.owner && (workspace.owner._id || workspace.owner).toString() === memId;
            await WorkspaceMember.findOneAndUpdate(
              { workspace: workspaceId, user: memId },
              { workspace: workspaceId, user: memId, role: isOwner ? 'OWNER' : 'MEMBER' },
              { upsert: true, new: true }
            );
          } catch {
            // ignore
          }
        }
      }
    }

    // Re-fetch populated members after self-healing
    members = await WorkspaceMember.find({ workspace: workspaceId })
      .populate('user', 'name username email avatar role')
      .lean();

    // Filter out any orphaned member records where user no longer exists in DB
    let validMembers: any[] = members.filter((m: any) => m && m.user);

    // If still empty but owner is defined on workspace, synthesize an owner member entry
    if (validMembers.length === 0 && workspace.owner) {
      validMembers = [
        {
          _id: workspace.owner._id || workspace.owner,
          workspace: workspace._id,
          user: workspace.owner,
          role: 'OWNER',
          joinedAt: workspace.createdAt || new Date(),
        },
      ];
    }

    return { ...workspace, memberDetails: validMembers };
  }

  static async updateWorkspace(workspaceId: string, name?: string, description?: string): Promise<IWorkspace> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw AppError.notFound('Workspace not found');

    if (name !== undefined) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    await workspace.save();

    return workspace;
  }

  static async deleteWorkspace(workspaceId: string): Promise<void> {
    await Promise.all([
      Workspace.findByIdAndDelete(workspaceId),
      WorkspaceMember.deleteMany({ workspace: workspaceId }),
    ]);
  }

  static async inviteMember(
    workspaceId: string,
    emailOrUsername: string,
    role: WorkspaceRole = 'MEMBER',
    actorId: string
  ): Promise<any> {
    const user = await User.findOne({
      $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
    });

    if (!user) {
      throw AppError.notFound('No user found with the provided email or username');
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: user._id,
    });

    if (existingMember) {
      throw AppError.conflict('User is already a member of this workspace');
    }

    const membership = await WorkspaceMember.create({
      workspace: workspaceId,
      user: user._id,
      role,
    });

    await Workspace.findByIdAndUpdate(workspaceId, {
      $addToSet: { members: user._id },
    });

    await ActivityService.log({
      workspace: workspaceId,
      actor: actorId,
      action: 'INVITED_MEMBER',
      metadata: { invitedUser: user.username, role },
    });

    return membership;
  }

  static async removeMember(workspaceId: string, targetUserId: string, actorId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw AppError.notFound('Workspace not found');

    if (workspace.owner.toString() === targetUserId) {
      throw AppError.badRequest('Cannot remove the owner from their own workspace');
    }

    await WorkspaceMember.findOneAndDelete({ workspace: workspaceId, user: targetUserId });
    await Workspace.findByIdAndUpdate(workspaceId, { $pull: { members: targetUserId } });

    await ActivityService.log({
      workspace: workspaceId,
      actor: actorId,
      action: 'REMOVED_MEMBER',
      metadata: { removedUserId: targetUserId },
    });
  }

  static async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole
  ): Promise<any> {
    const membership = await WorkspaceMember.findOneAndUpdate(
      { workspace: workspaceId, user: targetUserId },
      { role: newRole },
      { new: true }
    );
    if (!membership) throw AppError.notFound('Member not found in this workspace');
    return membership;
  }
}