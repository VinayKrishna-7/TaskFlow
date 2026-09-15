import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate, checkProjectAccess, checkWorkspaceMember } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator';

const router = Router();
router.use(authenticate);

router.post('/', validateRequest(createProjectSchema), checkWorkspaceMember(['OWNER', 'ADMIN']), ProjectController.createProject);
router.get('/', ProjectController.getWorkspaceProjects);
router.get('/:id', checkProjectAccess, ProjectController.getProjectById);
router.put('/:id', checkProjectAccess, validateRequest(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', checkProjectAccess, ProjectController.deleteProject);

export default router;