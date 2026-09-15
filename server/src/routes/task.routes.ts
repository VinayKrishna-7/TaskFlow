import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate, checkProjectAccess } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { uploadAttachment } from '../middleware/upload';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  addSubtaskSchema,
  logTimeSchema,
} from '../validators/task.validator';

const router = Router();
router.use(authenticate);

router.post('/', validateRequest(createTaskSchema), TaskController.createTask);
router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), TaskController.updateTask);
router.put('/:id/move', validateRequest(moveTaskSchema), TaskController.moveTaskPosition);
router.delete('/:id', TaskController.deleteTask);
router.post('/:id/duplicate', TaskController.duplicateTask);

// Subtasks
router.post('/:id/subtasks', validateRequest(addSubtaskSchema), TaskController.addSubtask);
router.put('/:id/subtasks/:subtaskId/toggle', TaskController.toggleSubtask);
router.delete('/:id/subtasks/:subtaskId', TaskController.deleteSubtask);

// Time tracking
router.post('/:id/time', validateRequest(logTimeSchema), TaskController.logTime);

// Attachments
router.post('/:id/attachments', uploadAttachment.single('file'), TaskController.uploadAttachment);

export default router;