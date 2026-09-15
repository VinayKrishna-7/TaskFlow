import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Workspace } from '../models/Workspace';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { Activity } from '../models/Activity';
import crypto from 'crypto';

export const seedDatabase = async (disconnectAfter = false) => {
  try {
    console.log('🌱 Starting TaskFlow Database Seeding...');
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      WorkspaceMember.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      Activity.deleteMany({}),
    ]);
    console.log('🧹 Purged existing database records');

    // 1. Create Demo Users
    const password = 'Password123!';
    const admin = await User.create({
      name: 'Alex Vance (Admin)',
      username: 'alex_admin',
      email: 'admin@taskflow.dev',
      password,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isEmailVerified: true,
      isActive: true,
    });

    const manager = await User.create({
      name: 'Sarah Connor (PM)',
      username: 'sarah_pm',
      email: 'manager@taskflow.dev',
      password,
      role: 'PROJECT_MANAGER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isEmailVerified: true,
      isActive: true,
    });

    const dev = await User.create({
      name: 'Rahul Sharma (Dev)',
      username: 'rahul_dev',
      email: 'user@taskflow.dev',
      password,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isEmailVerified: true,
      isActive: true,
    });

    const qa = await User.create({
      name: 'Priya Patel (QA)',
      username: 'priya_qa',
      email: 'priya@taskflow.dev',
      password,
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('👤 Created 4 demo accounts: admin, manager, rahul_dev, priya_qa');

    // 2. Create Workspace
    const workspace = await Workspace.create({
      name: 'TaskFlow HQ',
      description: 'Primary product development workspace for the TaskFlow platform',
      owner: admin._id,
      members: [admin._id, manager._id, dev._id, qa._id],
    });

    // Add Workspace Members
    await WorkspaceMember.create([
      { workspace: workspace._id, user: admin._id, role: 'OWNER' },
      { workspace: workspace._id, user: manager._id, role: 'ADMIN' },
      { workspace: workspace._id, user: dev._id, role: 'MEMBER' },
      { workspace: workspace._id, user: qa._id, role: 'MEMBER' },
    ]);

    // 3. Create Projects
    const coreProject = await Project.create({
      workspace: workspace._id,
      name: 'TaskFlow Core Web',
      key: 'TASK',
      description: 'Core web application features including Kanban, RBAC, and Real-time syncing',
      owner: manager._id,
      members: [admin._id, manager._id, dev._id, qa._id],
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const mobileProject = await Project.create({
      workspace: workspace._id,
      name: 'TaskFlow Mobile MVP',
      key: 'MBL',
      description: 'React Native companion app for cross-platform task management',
      owner: manager._id,
      members: [manager._id, dev._id],
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });

    console.log('📁 Created 2 Projects: TaskFlow Core Web (TASK) & Mobile MVP (MBL)');

    // 4. Create Rich Tasks
    const sampleTasks = [
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 1,
        title: 'Architect JWT Authentication & Refresh Token Rotation',
        description: 'Design secure dual-token authentication flow with HTTP-only cookies and cryptographic rotation.',
        status: 'COMPLETED',
        priority: 'HIGH',
        assignee: dev._id,
        reporter: manager._id,
        labels: ['Backend', 'Security', 'Auth'],
        estimatedHours: 8,
        actualHours: 7.5,
        position: 10000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'Implement access JWT with 15m expiration', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Design RefreshToken MongoDB schema with TTL', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Add token rotation and replay prevention logic', completed: true, createdAt: new Date() },
        ],
        timeEntries: [
          { id: crypto.randomUUID(), user: dev._id, description: 'JWT signature and verification', durationMinutes: 240, createdAt: new Date() },
          { id: crypto.randomUUID(), user: dev._id, description: 'Cookie handling and rotation logic', durationMinutes: 210, createdAt: new Date() },
        ],
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 2,
        title: 'Build Drag-and-Drop Kanban Board with Optimistic Updates',
        description: 'Interactive Kanban board using @dnd-kit with automatic rollback on network failure and smooth animations.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignee: dev._id,
        reporter: manager._id,
        labels: ['Frontend', 'UI/UX', 'Kanban'],
        estimatedHours: 12,
        actualHours: 6.0,
        position: 20000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'Setup DnD Context and Droppable Column Containers', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Implement Draggable Task Cards with grab handles', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Add optimistic UI state transition with TanStack Query', completed: false, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Persist fractional position indices to backend', completed: false, createdAt: new Date() },
        ],
        timeEntries: [
          { id: crypto.randomUUID(), user: dev._id, description: 'DnD kit integration and column sensors', durationMinutes: 360, createdAt: new Date() },
        ],
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 3,
        title: 'Setup Socket.IO Server for Multi-User Real-time Sync',
        description: 'Authenticate websockets and broadcast task events across connected clients in active workspace and project rooms.',
        status: 'IN_REVIEW',
        priority: 'HIGH',
        assignee: dev._id,
        reporter: manager._id,
        labels: ['WebSockets', 'Realtime', 'Backend'],
        estimatedHours: 6,
        actualHours: 5.5,
        position: 30000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'JWT handshake authentication middleware', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Project-level and user-level room subscription', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Dispatch task move and comment alerts', completed: true, createdAt: new Date() },
        ],
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 4,
        title: 'Implement Dark Mode & SaaS Design System',
        description: 'Build polished theme toggling system using Tailwind CSS with persistent user preference in localStorage.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        assignee: qa._id,
        reporter: manager._id,
        labels: ['Design System', 'Tailwind', 'Accessibility'],
        estimatedHours: 4,
        actualHours: 3.5,
        position: 40000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'Configure Tailwind darkMode class strategy', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Create ThemeProvider and persistent toggle switch', completed: true, createdAt: new Date() },
        ],
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 5,
        title: 'Integrate AI Task Breakdown Assistant',
        description: 'Provide an AI-powered assistant to decompose complex user stories into actionable subtasks with estimated hours.',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: dev._id,
        reporter: manager._id,
        labels: ['AI', 'Feature', 'Productivity'],
        estimatedHours: 8,
        actualHours: 0,
        position: 50000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'Design prompt breakdown service endpoint', completed: false, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Build interactive AI review dialog in frontend', completed: false, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Batch create generated tasks on user approval', completed: false, createdAt: new Date() },
        ],
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 6,
        title: 'Weekly Team Sprint Planning & Backlog Review',
        description: 'Recurring weekly meeting to prioritize backlog, review sprint velocity, and adjust milestone targets.',
        status: 'TODO',
        priority: 'LOW',
        assignee: manager._id,
        reporter: admin._id,
        labels: ['Meeting', 'Planning', 'Recurring'],
        estimatedHours: 2,
        actualHours: 0,
        position: 60000,
        recurrence: {
          type: 'WEEKLY',
          interval: 1,
          nextRunDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      {
        project: coreProject._id,
        workspace: workspace._id,
        taskNumber: 7,
        title: 'End-to-End Regression Testing & Security Verification',
        description: 'Verify RBAC access boundaries, rate limits, file upload restrictions, and token revocation scenarios.',
        status: 'IN_REVIEW',
        priority: 'URGENT',
        assignee: qa._id,
        reporter: manager._id,
        labels: ['QA', 'Security', 'Testing'],
        estimatedHours: 10,
        actualHours: 8.0,
        position: 70000,
        subtasks: [
          { id: crypto.randomUUID(), title: 'Test user role authorization restrictions', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Validate MIME type enforcement on file uploads', completed: true, createdAt: new Date() },
          { id: crypto.randomUUID(), title: 'Verify rate limiting response headers', completed: false, createdAt: new Date() },
        ],
      },
    ];

    const createdTasks = await Task.create(sampleTasks);
    console.log(`📋 Seeded ${createdTasks.length} realistic tasks with subtasks and time entries`);

    // 5. Create Comments & Mentions
    const comment1 = await Comment.create({
      task: createdTasks[1]._id,
      author: manager._id,
      content: '@rahul_dev please review the Kanban drag-and-drop boundary collisions on mobile touch devices.',
      mentions: [dev._id],
    });

    await Comment.create({
      task: createdTasks[1]._id,
      author: dev._id,
      content: 'Tested on viewport width 375px. The horizontal scroll container works seamlessly with touch sensors.',
      mentions: [],
    });

    console.log('💬 Seeded collaborative comments with @mentions');

    // 6. Create Notifications
    await Notification.create([
      {
        recipient: dev._id,
        type: 'MENTION',
        title: 'You were mentioned in a comment',
        message: 'Sarah Connor (PM) mentioned you on "Build Drag-and-Drop Kanban Board with Optimistic Updates"',
        relatedTask: createdTasks[1]._id,
        relatedProject: coreProject._id,
        isRead: false,
      },
      {
        recipient: dev._id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned to You',
        message: 'You have been assigned to "Architect JWT Authentication & Refresh Token Rotation"',
        relatedTask: createdTasks[0]._id,
        relatedProject: coreProject._id,
        isRead: true,
      },
      {
        recipient: qa._id,
        type: 'TASK_ASSIGNED',
        title: 'Task Assigned to You',
        message: 'You have been assigned to "End-to-End Regression Testing & Security Verification"',
        relatedTask: createdTasks[6]._id,
        relatedProject: coreProject._id,
        isRead: false,
      },
    ]);

    // 7. Create Activity Log Entries
    await Activity.create([
      {
        workspace: workspace._id,
        project: coreProject._id,
        task: createdTasks[0]._id,
        actor: dev._id,
        action: 'MOVED_STATUS',
        metadata: { from: 'IN_REVIEW', to: 'COMPLETED' },
      },
      {
        workspace: workspace._id,
        project: coreProject._id,
        task: createdTasks[1]._id,
        actor: manager._id,
        action: 'ADDED_COMMENT',
        metadata: { commentId: comment1._id },
      },
      {
        workspace: workspace._id,
        project: coreProject._id,
        task: createdTasks[1]._id,
        actor: dev._id,
        action: 'LOGGED_TIME',
        metadata: { durationMinutes: 360, totalActualHours: 6.0 },
      },
    ]);

    console.log('📜 Seeded chronological activity timeline and notification logs');
    console.log('🎉 TaskFlow Database Seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    if (disconnectAfter) {
      await disconnectDB();
    }
  }
};

if (require.main === module) {
  seedDatabase(true);
}