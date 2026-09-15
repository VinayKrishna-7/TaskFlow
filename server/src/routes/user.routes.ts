import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { User } from '../models/User';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

const router = Router();
router.use(authenticate);

// List workspace/system users for assignment search
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search as string;
    const filter: any = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(filter).select('name username email avatar role').limit(20).lean();
    ApiResponse.success(res, 'Users retrieved', { users });
  } catch (err) {
    next(err);
  }
});

// Admin-only user management
router.get('/admin/all', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    ApiResponse.success(res, 'All users retrieved', { users });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:id/toggle-status', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw AppError.notFound('User not found');
    user.isActive = !user.isActive;
    await user.save();
    ApiResponse.success(res, `User status updated to ${user.isActive ? 'active' : 'inactive'}`, { user });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:id/role', authorizeRoles('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'PROJECT_MANAGER', 'ADMIN'].includes(role)) {
      throw AppError.badRequest('Invalid role');
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) throw AppError.notFound('User not found');
    ApiResponse.success(res, 'User role updated', { user });
  } catch (err) {
    next(err);
  }
});

export default router;