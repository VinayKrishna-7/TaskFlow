import { Notification, INotification } from '../models/Notification';
import { emitToUser } from '../sockets/socketManager';
import { NotificationType } from '../types';

export class NotificationService {
  static async create(data: {
    recipient: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedTask?: string;
    relatedProject?: string;
  }): Promise<INotification> {
    const notification = await Notification.create(data);
    emitToUser(data.recipient, 'notification:new', notification);
    return notification;
  }

  static async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20
  ): Promise<{ notifications: INotification[]; unreadCount: number; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate('relatedTask', 'title')
        .populate('relatedProject', 'name key')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Notification.countDocuments({ recipient: userId }),
    ]);

    return { notifications: notifications as any, unreadCount, total };
  }

  static async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const res = await Notification.deleteOne({ _id: notificationId, recipient: userId });
    return res.deletedCount > 0;
  }

  static async clearAll(userId: string): Promise<void> {
    await Notification.deleteMany({ recipient: userId });
  }

  static async sendTestAlert(userId: string): Promise<INotification> {
    return this.create({
      recipient: userId,
      type: 'SYSTEM',
      title: 'Alert System Verified 🔔',
      message: 'Real-time notifications, audio chimes, and live alerts are functioning perfectly!',
    });
  }
}