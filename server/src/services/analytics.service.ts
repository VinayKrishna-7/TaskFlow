import { Task } from '../models/Task';
import { WorkspaceMember } from '../models/WorkspaceMember';
import mongoose from 'mongoose';

export class AnalyticsService {
  static async getWorkspaceAnalytics(workspaceId: string): Promise<any> {
    const wsObjectId = new mongoose.Types.ObjectId(workspaceId);

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      reviewTasks,
      overdueTasks,
      tasksByPriority,
      teamMembers,
    ] = await Promise.all([
      Task.countDocuments({ workspace: wsObjectId, isArchived: false }),
      Task.countDocuments({ workspace: wsObjectId, status: 'COMPLETED', isArchived: false }),
      Task.countDocuments({ workspace: wsObjectId, status: 'IN_PROGRESS', isArchived: false }),
      Task.countDocuments({ workspace: wsObjectId, status: 'TODO', isArchived: false }),
      Task.countDocuments({ workspace: wsObjectId, status: 'IN_REVIEW', isArchived: false }),
      Task.countDocuments({
        workspace: wsObjectId,
        status: { $ne: 'COMPLETED' },
        dueDate: { $lt: new Date() },
        isArchived: false,
      }),
      Task.aggregate([
        { $match: { workspace: wsObjectId, isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      WorkspaceMember.find({ workspace: wsObjectId }).populate('user', 'name username avatar').lean(),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const overdueRate = totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0;

    const memberIds = teamMembers.map((m: any) => m.user?._id).filter(Boolean);
    const workloadAgg = await Task.aggregate([
      {
        $match: {
          workspace: wsObjectId,
          assignee: { $in: memberIds },
          isArchived: false,
        },
      },
      {
        $group: {
          _id: '$assignee',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $ne: ['$status', 'COMPLETED'] }, 1, 0] } },
          actualHours: { $sum: '$actualHours' },
          estimatedHours: { $sum: '$estimatedHours' },
        },
      },
    ]);

    const teamWorkload = teamMembers
      .filter((m: any) => m.user)
      .map((m: any) => {
        const stats = workloadAgg.find((w) => w._id.toString() === m.user._id.toString()) || {
          total: 0,
          completed: 0,
          pending: 0,
          actualHours: 0,
          estimatedHours: 0,
        };
        return {
          user: m.user,
          role: m.role,
          ...stats,
        };
      });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const completionTrend = await Task.aggregate([
      {
        $match: {
          workspace: wsObjectId,
          status: 'COMPLETED',
          completedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          completed: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        overdueTasks,
        completionRate,
        overdueRate,
      },
      tasksByStatus: [
        { name: 'To Do', value: todoTasks },
        { name: 'In Progress', value: inProgressTasks },
        { name: 'In Review', value: reviewTasks },
        { name: 'Completed', value: completedTasks },
      ],
      tasksByPriority: tasksByPriority.map((p) => ({ name: p._id, count: p.count })),
      completionTrend,
      teamWorkload,
    };
  }
}