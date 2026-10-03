import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { User } from '../models/User';
import { AppError } from '../utils/appError';
import { EmailService } from '../services/email.service';

export class AuthController {
  static async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.created(res, 'User registered successfully', {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const emailOrUsername = (req.body.emailOrUsername || req.body.email || req.body.username || '').trim();
      const { password } = req.body;
      const result = await AuthService.login(emailOrUsername, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 'Logged in successfully', {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        throw AppError.unauthorized('Refresh token is required');
      }

      const result = await AuthService.refreshToken(token);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (token) {
        await AuthService.logout(token);
      }
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
      ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const user = await User.findById(req.user.id);
      if (!user) throw AppError.notFound('User not found');
      ApiResponse.success(res, 'Current user retrieved', { user });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const { resetToken, user } = await AuthService.forgotPassword(email);

      // Attempt to dispatch password reset email (safely handle when email provider is unavailable)
      try {
        await EmailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      } catch (mailErr) {
        console.warn('Notice: Email delivery unavailable or skipped for password reset:', mailErr);
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

      ApiResponse.success(res, `Account verified for ${user.email}. You can reset your password now.`, {
        email: user.email,
        resetToken,
        resetUrl,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, email, newPassword } = req.body;
      await AuthService.resetPassword({ token, email }, newPassword);
      ApiResponse.success(res, 'Password has been successfully reset. Please log in with your new password.');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      ApiResponse.success(res, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async seedDemo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seedDatabase } = await import('../utils/seed');
      await seedDatabase(false);
      ApiResponse.success(res, 'Demo database seeded successfully with accounts, workspace, and tasks');
    } catch (error) {
      next(error);
    }
  }
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { name, avatar, username, role } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) throw AppError.notFound('User not found');

      if (name !== undefined) user.name = name.trim();
      if (avatar !== undefined) user.avatar = avatar.trim();

      if (username !== undefined && username.trim().toLowerCase() !== user.username) {
        const cleanUsername = username.trim().toLowerCase();
        const existing = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (existing) {
          throw AppError.conflict('This username is already taken. Please choose another.');
        }
        user.username = cleanUsername;
      }

      if (role !== undefined) {
        user.role = role;
      }

      await user.save();

      ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}
