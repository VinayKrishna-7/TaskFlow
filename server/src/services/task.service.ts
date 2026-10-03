import { Task, ITask, ISubtask, ITimeEntry } from '../models/Task';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { emitToProject, emitToWorkspace } from '../sockets/socketManager';
import crypto from 'crypto';

export class TaskService {
  static async createTask(data: {
    project: string;
    workspace: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    reporter: string;
    labels?: string[];
    dueDate?: Date;
    startDate?: Date;
    estimatedHours?: number;
    recurrence?: any;
  }): Promise<ITask> {
    const highestPosTask = await Task.findOne({
      project: data.project,
      status: data.status || 'TODO',
    })
      .sort({ position: -1 })
      .select('position')
      .lean();

    const position = highestPosTask ? highestPosTask.position + 65535 : 65535;
    const taskCount = await Task.countDocuments({ project: data.project });
    const taskNumber = taskCount + 1;

    const task = await Task.create({
      ...data,
      taskNumber,
      position,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      labels: data.labels || [],
      estimatedHours: data.estimatedHours || 0,
      actualHours: 0,
      subtasks: [],
      attachments: [],
      watchers: [data.reporter],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name username avatar email')
      .populate('reporter', 'name username avatar')
      .populate('project', 'name key')
      .lean();

    await ActivityService.log({
      workspace: data.workspace,
      project: data.project,
      task: task._id.toString(),
      actor: data.reporter,
      action: 'CREATED_TASK',
      metadata: { title: task.title, status: task.status, priority: task.priority },
    });

    if (data.assignee && data.assignee !== data.reporter) {
      const projectDoc = await Project.findById(data.project);
      const assigneeDoc = await User.findById(data.assignee);

      await NotificationService.create({
        recipient: data.assignee,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `You have been assigned to task: "${task.title}"`,
        relatedTask: task._id.toString(),
        relatedProject: data.project,
      });

      if (assigneeDoc && projectDoc) {
        EmailService.sendTaskAssignedEmail(
          assigneeDoc.email,
          assigneeDoc.name,
          task.title,
          projectDoc.name
        ).catch(() => {});
      }
    }

    emitToProject(data.project, 'task:created', populatedTask);
    emitToWorkspace(data.workspace, 'task:created', populatedTask);

    return populatedTask as any;
  }

  static async getTasks(query: {
    project?: string;
    workspace?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    search?: string;
    label?: string;
    isArchived?: boolean;
    overdue?: boolean | string;
    dueDateStart?: string;
    dueDateEnd?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ tasks: ITask[]; total: number; page: number; totalPages: number }> {
    const filter: any = { isArchived: query.isArchived ?? false };

    if (query.project) filter.project = query.project;
    if (query.workspace) filter.workspace = query.workspace;
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.assignee) filter.assignee = query.assignee;
    if (query.label) filter.labels = query.label;

    if (query.overdue === true || query.overdue === 'true') {
      filter.status = { $ne: 'COMPLETED' };
      filter.dueDate = { ...(filter.dueDate || {}), $lt: new Date() };
    }

    if (query.search && query.search.trim()) {
      const trimmedSearch = query.search.trim();
      const escaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orConditions: any[] = [
        { title: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { labels: { $regex: escaped, $options: 'i' } },
      ];

      const numMatch = trimmedSearch.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        if (!isNaN(num)) {
          orConditions.push({ taskNumber: num });
        }
      }

      // Check matching projects (by name or key)
      const projectFilter: any = {
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { key: { $regex: escaped, $options: 'i' } },
        ],
      };
      if (query.workspace) {
        projectFilter.workspace = query.workspace;
      }
      const matchingProjects = await Project.find(projectFilter).select('_id').lean();
      if (matchingProjects.length > 0) {
        orConditions.push({ project: { $in: matchingProjects.map((p) => p._id) } });
      }

      // Check matching assignees
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { username: { $regex: escaped, $options: 'i' } },
        ],
      }).select('_id').lean();
      if (matchingUsers.length > 0) {
        orConditions.push({ assignee: { $in: matchingUsers.map((u) => u._id) } });
      }

      filter.$or = orConditions;
    }

    if (query.dueDateStart || query.dueDateEnd) {
      filter.dueDate = {};
      if (query.dueDateStart) filter.dueDate.$gte = new Date(query.dueDateStart);
      if (query.dueDateEnd) filter.dueDate.$lte = new Date(query.dueDateEnd);
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    let sort: any = { position: 1 };
    if (query.sortBy) {
      const order = query.sortOrder === 'desc' ? -1 : 1;
      sort = { [query.sortBy]: order };
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignee', 'name username avatar email')
        .populate('reporter', 'name username avatar')
        .populate('project', 'name key')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    return {
      tasks: tasks as any,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getTaskById(taskId: string): Promise<any> {
    const task = await Task.findById(taskId)
      .populate('assignee', 'name username avatar email')
      .populate('reporter', 'name username avatar email')
      .populate('watchers', 'name username avatar')
      .populate('project', 'name key workspace')
      .populate('attachments.uploadedBy', 'name username avatar')
      .populate('timeEntries.user', 'name username avatar')
      .lean();

    if (!task) throw AppError.notFound('Task not found');
    return task;
  }

  static async updateTask(taskId: string, updateData: any, actorId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const previousStatus = task.status;
    const previousAssignee = task.assignee?.toString();
    const previousPriority = task.priority;

    if (updateData.status && updateData.status === 'COMPLETED' && task.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (updateData.status && updateData.status !== 'COMPLETED') {
      updateData.completedAt = null;
    }

    Object.assign(task, updateData);
    await task.save();

    if (task.status === 'COMPLETED' && task.recurrence && task.recurrence.type !== 'NONE') {
      await this.handleTaskRecurrence(task);
    }

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name username avatar email')
      .populate('reporter', 'name username avatar')
      .populate('project', 'name key')
      .lean();

    if (updateData.status && updateData.status !== previousStatus) {
      await ActivityService.log({
        workspace: task.workspace.toString(),
        project: task.project.toString(),
        task: task._id.toString(),
        actor: actorId,
        action: 'MOVED_STATUS',
        metadata: { from: previousStatus, to: task.status },
      });

      if (task.assignee) {
        NotificationService.create({
          recipient: task.assignee.toString(),
          type: 'TASK_STATUS_CHANGED',
          title: 'Task Status Alert',
          message: `Status of "${task.title}" moved to ${task.status.replace('_', ' ')}`,
          relatedTask: task._id.toString(),
          relatedProject: task.project.toString(),
        }).catch(() => {});
      }
    }

    if (updateData.assignee && updateData.assignee !== previousAssignee) {
      await ActivityService.log({
        workspace: task.workspace.toString(),
        project: task.project.toString(),
        task: task._id.toString(),
        actor: actorId,
        action: 'REASSIGNED_TASK',
        metadata: { assignee: updateData.assignee },
      });

      if (updateData.assignee) {
        NotificationService.create({
          recipient: updateData.assignee,
          type: 'TASK_ASSIGNED',
          title: 'Task Assigned Alert',
          message: `You have been assigned to "${task.title}"`,
          relatedTask: task._id.toString(),
          relatedProject: task.project.toString(),
        }).catch(() => {});
      }
    }

    if (updateData.priority && updateData.priority !== previousPriority) {
      await ActivityService.log({
        workspace: task.workspace.toString(),
        project: task.project.toString(),
        task: task._id.toString(),
        actor: actorId,
        action: 'CHANGED_PRIORITY',
        metadata: { from: previousPriority, to: task.priority },
      });
    }

    emitToProject(task.project.toString(), 'task:updated', populated);
    emitToWorkspace(task.workspace.toString(), 'task:updated', populated);

    return populated as any;
  }

  static async moveTaskPosition(
    taskId: string,
    newStatus: string,
    newPosition: number,
    actorId: string
  ): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const previousStatus = task.status;
    task.status = newStatus as any;
    task.position = newPosition;

    if (newStatus === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      task.completedAt = new Date();
    } else if (newStatus !== 'COMPLETED') {
      task.completedAt = undefined;
    }

    await task.save();

    if (task.status === 'COMPLETED' && task.recurrence && task.recurrence.type !== 'NONE') {
      await this.handleTaskRecurrence(task);
    }

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name username avatar email')
      .populate('reporter', 'name username avatar')
      .populate('project', 'name key')
      .lean();

    if (previousStatus !== newStatus) {
      await ActivityService.log({
        workspace: task.workspace.toString(),
        project: task.project.toString(),
        task: task._id.toString(),
        actor: actorId,
        action: 'MOVED_STATUS',
        metadata: { from: previousStatus, to: newStatus },
      });
    }

    emitToProject(task.project.toString(), 'task:moved', populated);
    emitToWorkspace(task.workspace.toString(), 'task:moved', populated);

    return populated as any;
  }

  static async deleteTask(taskId: string, actorId: string): Promise<void> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    await Task.findByIdAndDelete(taskId);

    await ActivityService.log({
      workspace: task.workspace.toString(),
      project: task.project.toString(),
      actor: actorId,
      action: 'DELETED_TASK',
      metadata: { taskTitle: task.title, taskId },
    });

    emitToProject(task.project.toString(), 'task:deleted', { taskId });
    emitToWorkspace(task.workspace.toString(), 'task:deleted', { taskId });
  }

  static async duplicateTask(taskId: string, actorId: string): Promise<ITask> {
    const original = await Task.findById(taskId);
    if (!original) throw AppError.notFound('Task not found');

    const highestPosTask = await Task.findOne({
      project: original.project,
      status: original.status,
    })
      .sort({ position: -1 })
      .select('position')
      .lean();

    const position = highestPosTask ? highestPosTask.position + 65535 : 65535;
    const taskCount = await Task.countDocuments({ project: original.project });

    const duplicated = await Task.create({
      project: original.project,
      workspace: original.workspace,
      taskNumber: taskCount + 1,
      title: `${original.title} (Copy)`,
      description: original.description,
      status: original.status,
      priority: original.priority,
      assignee: original.assignee,
      reporter: actorId,
      labels: [...original.labels],
      estimatedHours: original.estimatedHours,
      actualHours: 0,
      position,
      subtasks: original.subtasks.map((s) => ({
        id: crypto.randomUUID(),
        title: s.title,
        completed: false,
        createdAt: new Date(),
      })),
      watchers: [actorId],
    });

    return Task.findById(duplicated._id)
      .populate('assignee', 'name username avatar')
      .populate('reporter', 'name username avatar')
      .populate('project', 'name key')
      .lean() as any;
  }

  static async addSubtask(taskId: string, title: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    task.subtasks.push({
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date(),
    });

    await task.save();
    return task;
  }

  static async toggleSubtask(taskId: string, subtaskId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const sub = task.subtasks.find((s) => s.id === subtaskId);
    if (!sub) throw AppError.notFound('Subtask not found');

    sub.completed = !sub.completed;
    await task.save();
    return task;
  }

  static async deleteSubtask(taskId: string, subtaskId: string): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    task.subtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    await task.save();
    return task;
  }

  static async logTime(
    taskId: string,
    userId: string,
    durationMinutes: number,
    description?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<ITask> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const entry: ITimeEntry = {
      id: crypto.randomUUID(),
      user: userId as any,
      durationMinutes,
      description,
      startTime,
      endTime,
      createdAt: new Date(),
    };

    task.timeEntries.push(entry);
    const totalMinutes = task.timeEntries.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    task.actualHours = Number((totalMinutes / 60).toFixed(2));

    await task.save();

    await ActivityService.log({
      workspace: task.workspace.toString(),
      project: task.project.toString(),
      task: task._id.toString(),
      actor: userId,
      action: 'LOGGED_TIME',
      metadata: { durationMinutes, totalActualHours: task.actualHours },
    });

    return task;
  }

  private static async handleTaskRecurrence(task: ITask): Promise<void> {
    if (!task.recurrence || task.recurrence.type === 'NONE') return;

    const nextDate = new Date(task.dueDate || new Date());
    const interval = task.recurrence.interval || 1;

    if (task.recurrence.type === 'DAILY') {
      nextDate.setDate(nextDate.getDate() + interval);
    } else if (task.recurrence.type === 'WEEKLY') {
      nextDate.setDate(nextDate.getDate() + interval * 7);
    } else if (task.recurrence.type === 'MONTHLY') {
      nextDate.setMonth(nextDate.getMonth() + interval);
    }

    const taskCount = await Task.countDocuments({ project: task.project });

    await Task.create({
      project: task.project,
      workspace: task.workspace,
      taskNumber: taskCount + 1,
      title: task.title,
      description: task.description,
      status: 'TODO',
      priority: task.priority,
      assignee: task.assignee,
      reporter: task.reporter,
      labels: task.labels,
      dueDate: nextDate,
      estimatedHours: task.estimatedHours,
      actualHours: 0,
      recurrence: task.recurrence,
      position: 65535,
      subtasks: task.subtasks.map((s) => ({
        id: crypto.randomUUID(),
        title: s.title,
        completed: false,
        createdAt: new Date(),
      })),
      watchers: task.watchers,
    });
  }
}