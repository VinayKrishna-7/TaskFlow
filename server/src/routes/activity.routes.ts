import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/task/:taskId', ActivityController.getTaskActivity);
router.get('/project/:projectId', ActivityController.getProjectActivity);
router.get('/workspace/:workspaceId', ActivityController.getWorkspaceActivity);

export default router;