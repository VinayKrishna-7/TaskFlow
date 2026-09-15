import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    workspace: z.string().min(1, 'Workspace ID is required'),
    name: z.string().min(2, 'Project name must be at least 2 characters').max(100),
    key: z.string().min(2, 'Key must be at least 2 characters').max(10).regex(/^[a-zA-Z0-9]+$/, 'Key must be alphanumeric'),
    description: z.string().max(1000).optional(),
    members: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional().or(z.string().length(0).optional()),
    dueDate: z.string().datetime().optional().or(z.string().length(0).optional()),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    members: z.array(z.string()).optional(),
    startDate: z.string().datetime().optional().or(z.string().length(0).optional()),
    dueDate: z.string().datetime().optional().or(z.string().length(0).optional()),
  }),
});