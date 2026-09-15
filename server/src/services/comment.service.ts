import { Comment, IComment } from '../models/Comment';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';
import { emitToProject } from '../sockets/socketManager';

export class CommentService {
  static async addComment(taskId: string, authorId: string, content: string): Promise<IComment> {
    const task = await Task.findById(taskId);
    if (!task) throw AppError.notFound('Task not found');

    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const usernames: string[] = [];
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      usernames.push(match[1].toLowerCase());
    }

    let mentionedUserIds: string[] = [];
    if (usernames.length > 0) {
      const users = await User.find({ username: { $in: usernames } }).select('_id');
      mentionedUserIds = users.map((u) => u._id.toString());
    }

    const comment = await Comment.create({
      task: taskId,
      author: authorId,
      content,
      mentions: mentionedUserIds,
    });

    const populated = await Comment.findById(comment._id)
      .populate('author', 'name username avatar')
      .lean();

    await ActivityService.log({
      workspace: task.workspace.toString(),
      project: task.project.toString(),
      task: taskId,
      actor: authorId,
      action: 'ADDED_COMMENT',
      metadata: { commentId: comment._id },
    });

    for (const userId of mentionedUserIds) {
      if (userId !== authorId) {
        NotificationService.create({
          recipient: userId,
          type: 'MENTION',
          title: 'You were mentioned in a comment',
          message: `You were mentioned in a comment on "${task.title}"`,
          relatedTask: taskId,
          relatedProject: task.project.toString(),
        }).catch(() => {});
      }
    }

    if (
      task.assignee &&
      task.assignee.toString() !== authorId &&
      !mentionedUserIds.includes(task.assignee.toString())
    ) {
      NotificationService.create({
        recipient: task.assignee.toString(),
        type: 'COMMENT',
        title: 'New Comment on Task',
        message: `A new comment was added to "${task.title}"`,
        relatedTask: taskId,
        relatedProject: task.project.toString(),
      }).catch(() => {});
    }

    emitToProject(task.project.toString(), 'comment:created', populated);

    return populated as any;
  }

  static async getTaskComments(taskId: string): Promise<any[]> {
    return Comment.find({ task: taskId })
      .populate('author', 'name username avatar email')
      .sort({ createdAt: 1 })
      .lean();
  }

  static async deleteComment(commentId: string, authorId: string, isAdmin = false): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) throw AppError.notFound('Comment not found');

    if (comment.author.toString() !== authorId && !isAdmin) {
      throw AppError.forbidden('You can only delete your own comments');
    }

    await Comment.findByIdAndDelete(commentId);
  }
}