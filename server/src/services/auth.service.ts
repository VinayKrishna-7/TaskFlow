import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/appError';
import { generateAccessToken, generateRefreshTokenString, hashToken } from '../utils/token';
import { UserRole } from '../types';

export class AuthService {
  static async register(data: {
    name: string;
    username?: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw AppError.conflict('An account with this email already exists. Please sign in instead.');
    }

    // Auto-generate a clean unique username if not provided
    let finalUsername = data.username ? data.username.toLowerCase().trim() : '';
    if (!finalUsername) {
      const base = normalizedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'user';
      finalUsername = base;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${base}_${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) break;
      }
    } else {
      const existingUser = await User.findOne({ username: finalUsername });
      if (existingUser) {
        finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const user = await User.create({
      name: data.name.trim(),
      username: finalUsername,
      email: normalizedEmail,
      password: data.password,
      role: data.role || 'USER',
      isEmailVerified: true,
      isActive: true,
    });

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: refreshTokenString,
      user: user._id,
      expiresAt,
    });

    return { user, accessToken, refreshToken: refreshTokenString };
  }

  static async login(
    emailOrUsername: string,
    candidatePass: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const trimmedIdentifier = (emailOrUsername || '').toLowerCase().trim();
    if (!trimmedIdentifier) {
      throw AppError.badRequest('Please enter your email address or username');
    }

    const query = trimmedIdentifier.includes('@')
      ? { email: trimmedIdentifier }
      : { username: trimmedIdentifier };

    const user = await User.findOne(query).select('+password');
    if (!user) {
      throw AppError.unauthorized('No account found with this email. Please check your email or create an account.');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await user.comparePassword(candidatePass);
    if (!isMatch) {
      throw AppError.unauthorized('Incorrect password. Please try again or click Forgot password?.');
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    const refreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      token: refreshTokenString,
      user: user._id,
      expiresAt,
    });

    return { user, accessToken, refreshToken: refreshTokenString };
  }

  static async refreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenDoc = await RefreshToken.findOne({ token: oldToken });

    if (!tokenDoc) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    if (tokenDoc.isRevoked) {
      // Possible token theft! Revoke all tokens for this user
      await RefreshToken.updateMany({ user: tokenDoc.user }, { isRevoked: true });
      throw AppError.unauthorized('Revoked refresh token reuse detected. Access denied.');
    }

    if (tokenDoc.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token expired. Please log in again.');
    }

    const user = await User.findById(tokenDoc.user);
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found or inactive');
    }

    // Token rotation
    const newRefreshTokenString = generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    tokenDoc.isRevoked = true;
    tokenDoc.replacedByToken = newRefreshTokenString;
    await tokenDoc.save();

    await RefreshToken.create({
      token: newRefreshTokenString,
      user: user._id,
      expiresAt,
    });

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role,
    });

    return { accessToken, refreshToken: newRefreshTokenString };
  }

  static async logout(refreshTokenString: string): Promise<void> {
    if (refreshTokenString) {
      await RefreshToken.updateOne({ token: refreshTokenString }, { isRevoked: true });
    }
  }

  static async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success anyway for security timing attack prevention
      return { resetToken: '' };
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = hashToken(rawResetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return { resetToken: rawResetToken };
  }

  static async resetPassword(token: string, newPass: string): Promise<void> {
    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw AppError.badRequest('Password reset token is invalid or has expired');
    }

    user.password = newPass;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing refresh tokens for security
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });
  }

  static async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) throw AppError.notFound('User not found');

    const isMatch = await user.comparePassword(currentPass);
    if (!isMatch) {
      throw AppError.badRequest('Current password is incorrect');
    }

    user.password = newPass;
    await user.save();
  }
}
