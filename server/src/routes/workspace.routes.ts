import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { authenticate, checkWorkspaceMember, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/workspace.validator';

const router = Router();
router.use(authenticate);

router.post('/', validateRequest(createWorkspaceSchema), WorkspaceController.createWorkspace);
router.get('/', WorkspaceController.getUserWorkspaces);
router.get('/:id', checkWorkspaceMember(), WorkspaceController.getWorkspaceById);
router.put('/:id', checkWorkspaceMember(['OWNER', 'ADMIN']), validateRequest(updateWorkspaceSchema), WorkspaceController.updateWorkspace);
router.delete('/:id', checkWorkspaceMember(['OWNER']), WorkspaceController.deleteWorkspace);

router.post('/:id/invite', checkWorkspaceMember(['OWNER', 'ADMIN']), validateRequest(inviteMemberSchema), WorkspaceController.inviteMember);
router.delete('/:id/members/:userId', checkWorkspaceMember(['OWNER', 'ADMIN']), WorkspaceController.removeMember);
router.put('/:id/members/:userId/role', checkWorkspaceMember(['OWNER']), validateRequest(updateMemberRoleSchema), WorkspaceController.updateMemberRole);

export default router;