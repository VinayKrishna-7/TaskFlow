import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IUserPayload } from '../types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'taskflow_access_super_secret_jwt_key_2026_xyz123!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'taskflow_refresh_super_secret_jwt_key_2026_abc987!';
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (payload: IUserPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN as any,
  });
};

export const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const verifyAccessToken = (token: string): IUserPayload => {
  return jwt.verify(token, ACCESS_SECRET) as IUserPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
