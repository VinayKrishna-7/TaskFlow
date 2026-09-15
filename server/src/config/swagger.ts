import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TaskFlow REST API',
    version: '1.0.0',
    description: 'Production-grade enterprise task management and team collaboration API built with MERN stack.',
    contact: {
      name: 'TaskFlow Engineering Team',
      email: 'support@taskflow.dev',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'Default API Base',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'username', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Alex Turner' },
                  username: { type: 'string', example: 'alexturner' },
                  email: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  role: { type: 'string', enum: ['USER', 'PROJECT_MANAGER', 'ADMIN'], example: 'USER' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          409: { description: 'Email or username already exists' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in with credentials',
        tags: ['Authentication'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['emailOrUsername', 'password'],
                properties: {
                  emailOrUsername: { type: 'string', example: 'alex@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/tasks': {
      get: {
        summary: 'Query tasks with pagination, filtering and search',
        tags: ['Tasks'],
        parameters: [
          { name: 'project', in: 'query', schema: { type: 'string' } },
          { name: 'workspace', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'Tasks list retrieved' },
        },
      },
      post: {
        summary: 'Create a new task',
        tags: ['Tasks'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['project', 'workspace', 'title'],
                properties: {
                  project: { type: 'string' },
                  workspace: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'] },
                  priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
                  assignee: { type: 'string' },
                  estimatedHours: { type: 'number' },
                  dueDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Task created' },
        },
      },
    },
    '/analytics/workspace/{workspaceId}': {
      get: {
        summary: 'Get workspace analytics and productivity trends',
        tags: ['Analytics'],
        parameters: [
          { name: 'workspaceId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Analytics breakdown retrieved' },
        },
      },
    },
    '/ai/breakdown': {
      post: {
        summary: 'AI Task Planner breakdown for project goals',
        tags: ['AI Assistant'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: 'Build an e-commerce website in 2 weeks' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Structured breakdown generated' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};