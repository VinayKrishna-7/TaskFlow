import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';

let mongoServer: MongoMemoryServer;
let adminToken: string;
let devToken: string;
let workspaceId: string;
let projectId: string;
let taskId: string;

import { connectDB, disconnectDB } from '../src/config/db';

beforeAll(async () => {
  process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/taskflow_test';
  await connectDB();
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (e) {}
  }
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('TaskFlow Full API Integration Test Suite', () => {
  describe('Health Check Endpoint', () => {
    it('should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('Authentication & RBAC', () => {
    it('should register an admin user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Admin Test User',
        username: 'admintest',
        email: 'admin@test.com',
        password: 'Password123!',
        role: 'ADMIN',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      adminToken = res.body.data.accessToken;
    });

    it('should register a developer user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Developer Test User',
        username: 'devtest',
        email: 'dev@test.com',
        password: 'Password123!',
        role: 'USER',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      devToken = res.body.data.accessToken;
    });

    it('should reject registration with duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate Email',
        username: 'unique_user',
        email: 'admin@test.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should login successfully with valid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        emailOrUsername: 'admin@test.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('admin@test.com');
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        emailOrUsername: 'admin@test.com',
        password: 'WrongPassword999!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should retrieve current user via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.username).toBe('admintest');
    });
  });

  describe('Workspaces & Projects', () => {
    it('should create a new workspace', async () => {
      const res = await request(app)
        .post('/api/workspaces')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Acme Product HQ',
          description: 'Testing workspace for integration suite',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.workspace.name).toBe('Acme Product HQ');
      workspaceId = res.body.data.workspace._id;
    });

    it('should invite developer user to the workspace', async () => {
      const res = await request(app)
        .post(`/api/workspaces/${workspaceId}/invite`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          emailOrUsername: 'devtest',
          role: 'MEMBER',
        });

      expect(res.status).toBe(201);
    });

    it('should create a project within the workspace', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          workspace: workspaceId,
          name: 'Core Application',
          key: 'CORE',
          description: 'Main project for tests',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.key).toBe('CORE');
      projectId = res.body.data.project._id;
    });

    it('should retrieve projects for the workspace', async () => {
      const res = await request(app)
        .get(`/api/projects?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.projects.length).toBeGreaterThan(0);
    });
  });

  describe('Tasks & Kanban Operations', () => {
    it('should create a new task in the project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          project: projectId,
          workspace: workspaceId,
          title: 'Implement OAuth Login Provider',
          description: 'Connect Google OAuth2 login flow',
          status: 'TODO',
          priority: 'HIGH',
          estimatedHours: 4,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('Implement OAuth Login Provider');
      taskId = res.body.data.task._id;
    });

    it('should add a subtask to the task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/subtasks`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Register Google Cloud Console OAuth App',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.task.subtasks.length).toBe(1);
    });

    it('should move task status (Kanban movement)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}/move`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'IN_PROGRESS',
          position: 15000,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('IN_PROGRESS');
    });

    it('should log time on the task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/time`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          durationMinutes: 120,
          description: 'Client configuration and secret keys',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.task.actualHours).toBe(2);
    });

    it('should retrieve tasks with server-side filtering', async () => {
      const res = await request(app)
        .get(`/api/tasks?project=${projectId}&status=IN_PROGRESS`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBe(1);
    });
  });

  describe('Comments & Notifications', () => {
    it('should add a comment with @devtest mention', async () => {
      const res = await request(app)
        .post(`/api/comments/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Hello @devtest please check the OAuth redirect URL.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.content).toContain('@devtest');
    });

    it('should deliver notification to the mentioned user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.notifications.length).toBeGreaterThan(0);
      expect(res.body.data.notifications[0].type).toBe('MENTION');
    });
  });

  describe('AI Task Breakdown Service', () => {
    it('should return a structured breakdown of tasks from a prompt', async () => {
      const res = await request(app)
        .post('/api/ai/breakdown')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          prompt: 'Build an e-commerce website in 2 weeks',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.tasks.length).toBeGreaterThan(3);
      expect(res.body.data.tasks[0]).toHaveProperty('title');
      expect(res.body.data.tasks[0]).toHaveProperty('estimatedHours');
    });
  });

  describe('Workspace Analytics Aggregation', () => {
    it('should calculate analytics summary for workspace', async () => {
      const res = await request(app)
        .get(`/api/analytics/workspace/${workspaceId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.analytics.overview.totalTasks).toBeGreaterThan(0);
      expect(res.body.data.analytics.tasksByStatus).toBeDefined();
    });
  });
});