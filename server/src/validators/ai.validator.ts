import { z } from 'zod';

export const aiBreakdownSchema = z.object({
  body: z.object({
    prompt: z.string().trim().min(3, 'Prompt must be at least 3 characters long').max(500, 'Prompt must not exceed 500 characters'),
  }),
});