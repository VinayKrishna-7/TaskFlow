import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, checkWorkspaceMember } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/workspace/:workspaceId', checkWorkspaceMember(), AnalyticsController.getWorkspaceAnalytics);

export default router;