import { Activity, IActivity } from '../models/Activity';

export class ActivityService {
  static async log(data: {
    workspace: string;
    project?: string;
    task?: string;
    actor: string;
    action: string;
    metadata?: Record<string, any>;
  }): Promise<IActivity> {
    try {
      const activity = await Activity.create({
        workspace: data.workspace,
        project: data.project,
        task: data.task,
        actor: data.actor,
        action: data.action,
        metadata: data.metadata || {},
      });
      return activity;
    } catch (err) {
      console.error('Failed to log activity:', err);
      throw err;
    }
  }

  static async getForTask(taskId: string): Promise<any[]> {
    return Activity.find({ task: taskId })
      .populate('actor', 'name username avatar')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getForProject(projectId: string, limit = 50): Promise<any[]> {
    return Activity.find({ project: projectId })
      .populate('actor', 'name username avatar')
      .populate('task', 'title taskNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async getForWorkspace(workspaceId: string, limit = 50): Promise<any[]> {
    return Activity.find({ workspace: workspaceId })
      .populate('actor', 'name username avatar')
      .populate('project', 'name key')
      .populate('task', 'title taskNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}