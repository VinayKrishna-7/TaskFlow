import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    project: z.string().min(1, 'Project ID is required'),
    workspace: z.string().min(1, 'Workspace ID is required'),
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']).default('TODO'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    assignee: z.string().optional().or(z.literal('')),
    labels: z.array(z.string()).default([]),
    dueDate: z.string().datetime().optional().or(z.string().length(0).optional()),
    startDate: z.string().datetime().optional().or(z.string().length(0).optional()),
    estimatedHours: z.number().min(0).default(0),
    recurrence: z
      .object({
        type: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
        interval: z.number().min(1).default(1),
      })
      .optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignee: z.string().optional().nullable(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional().nullable().or(z.string().length(0).optional()),
    startDate: z.string().datetime().optional().nullable().or(z.string().length(0).optional()),
    estimatedHours: z.number().min(0).optional(),
    isArchived: z.boolean().optional(),
    recurrence: z
      .object({
        type: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']),
        interval: z.number().min(1),
      })
      .optional(),
  }),
});

export const moveTaskSchema = z.object({
  body: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED']),
    position: z.number(),
  }),
});

export const addSubtaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Subtask title is required'),
  }),
});

export const logTimeSchema = z.object({
  body: z.object({
    durationMinutes: z.number().min(1, 'Duration must be at least 1 minute'),
    description: z.string().optional(),
  }),
});