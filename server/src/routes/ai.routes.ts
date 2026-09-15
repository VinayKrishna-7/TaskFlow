import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { aiBreakdownSchema } from '../validators/ai.validator';

const router = Router();
router.use(authenticate);

router.post('/breakdown', validateRequest(aiBreakdownSchema), AIController.breakdown);

export default router;