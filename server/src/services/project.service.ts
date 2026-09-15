import { Project, IProject } from '../models/Project';
import { Task } from '../models/Task';
import { AppError } from '../utils/appError';
import { ActivityService } from './activity.service';

export class ProjectService {
  static async createProject(data: {
    workspace: string;
    name: string;
    key: string;
    description?: string;
    owner: string;
    members?: string[];
    startDate?: Date;
    dueDate?: Date;
  }): Promise<IProject> {
    const existing = await Project.findOne({
      workspace: data.workspace,
      key: data.key.toUpperCase(),
    });

    if (existing) {
      throw AppError.conflict(`Project key '${data.key.toUpperCase()}' is already used in this workspace`);
    }

    const members = Array.from(new Set([data.owner, ...(data.members || [])]));

    const project = await Project.create({
      workspace: data.workspace,
      name: data.name,
      key: data.key.toUpperCase(),
      description: data.description || '',
      owner: data.owner,
      members,
      startDate: data.startDate,
      dueDate: data.dueDate,
    });

    await ActivityService.log({
      workspace: data.workspace,
      project: project._id.toString(),
      actor: data.owner,
      action: 'CREATED_PROJECT',
      metadata: { projectName: data.name, key: project.key },
    });

    return project;
  }

  static async getWorkspaceProjects(workspaceId: string): Promise<any[]> {
    const projects = await Project.find({ workspace: workspaceId })
      .populate('owner', 'name username avatar')
      .populate('members', 'name username avatar')
      .sort({ updatedAt: -1 })
      .lean();

    const projectWithStats = await Promise.all(
      projects.map(async (prj) => {
        const [total, completed, inProgress, overdue] = await Promise.all([
          Task.countDocuments({ project: prj._id, isArchived: false }),
          Task.countDocuments({ project: prj._id, status: 'COMPLETED', isArchived: false }),
          Task.countDocuments({ project: prj._id, status: 'IN_PROGRESS', isArchived: false }),
          Task.countDocuments({
            project: prj._id,
            status: { $ne: 'COMPLETED' },
            dueDate: { $lt: new Date() },
            isArchived: false,
          }),
        ]);

        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return {
          ...prj,
          stats: { total, completed, inProgress, overdue, completionPercentage },
        };
      })
    );

    return projectWithStats;
  }

  static async getProjectById(projectId: string): Promise<any> {
    const project = await Project.findById(projectId)
      .populate('owner', 'name username email avatar')
      .populate('members', 'name username email avatar')
      .populate('workspace', 'name')
      .lean();

    if (!project) throw AppError.notFound('Project not found');

    const [total, completed, inProgress, overdue] = await Promise.all([
      Task.countDocuments({ project: projectId, isArchived: false }),
      Task.countDocuments({ project: projectId, status: 'COMPLETED', isArchived: false }),
      Task.countDocuments({ project: projectId, status: 'IN_PROGRESS', isArchived: false }),
      Task.countDocuments({
        project: projectId,
        status: { $ne: 'COMPLETED' },
        dueDate: { $lt: new Date() },
        isArchived: false,
      }),
    ]);

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...project,
      stats: { total, completed, inProgress, overdue, completionPercentage },
    };
  }

  static async updateProject(projectId: string, updateData: Partial<IProject>, actorId: string): Promise<IProject> {
    const project = await Project.findByIdAndUpdate(projectId, updateData, { new: true });
    if (!project) throw AppError.notFound('Project not found');

    await ActivityService.log({
      workspace: project.workspace.toString(),
      project: projectId,
      actor: actorId,
      action: 'UPDATED_PROJECT',
      metadata: updateData,
    });

    return project;
  }

  static async deleteProject(projectId: string, actorId: string): Promise<void> {
    const project = await Project.findById(projectId);
    if (!project) throw AppError.notFound('Project not found');

    await Promise.all([
      Project.findByIdAndDelete(projectId),
      Task.deleteMany({ project: projectId }),
    ]);

    await ActivityService.log({
      workspace: project.workspace.toString(),
      actor: actorId,
      action: 'DELETED_PROJECT',
      metadata: { projectName: project.name, key: project.key },
    });
  }
}