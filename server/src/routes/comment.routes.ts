import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { addCommentSchema } from '../validators/comment.validator';

const router = Router();
router.use(authenticate);

router.post('/:taskId', validateRequest(addCommentSchema), CommentController.addComment);
router.get('/:taskId', CommentController.getTaskComments);
router.delete('/:id', CommentController.deleteComment);

export default router;