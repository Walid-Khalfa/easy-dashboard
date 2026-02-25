import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../models/Admin';
import { addToBlocklist, isTokenBlocked } from '../utils/tokenBlocklist';
import { AuthenticationError, NotFoundError, ValidationError } from '../utils/errors';

// Configuration constants
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  admin: IAdmin;
  tokens: AuthTokens;
}

export interface ValidationResult {
  valid: boolean;
  admin?: IAdmin;
  error?: string;
}

/**
 * Generate access token for user
 */
export const generateAccessToken = (adminId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Get refresh secret with fallback for development
 */
const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET is required in production');
    }
    console.warn('WARNING: Using default refresh secret. Set JWT_REFRESH_SECRET for production.');
    return 'dev_refresh_secret_change_in_production';
  }
  return secret;
};

/**
 * Generate refresh token for user
 */
export const generateRefreshToken = (adminId: string): string => {
  return jwt.sign({ id: adminId }, getRefreshSecret(), { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

/**
 * Verify password against stored hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Register a new admin user
 */
export const registerAdmin = async (
  email: string,
  password: string,
  name: string,
  surname: string
): Promise<IAdmin> => {
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ValidationError('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const newAdmin = new Admin({
    email,
    password: passwordHash,
    name,
    surname,
  });

  return newAdmin.save();
};

/**
 * Authenticate user and return tokens
 */
export const loginAdmin = async (email: string, password: string): Promise<LoginResult> => {
  const admin = await Admin.findOne({ email });
  if (!admin) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if account is locked
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AuthenticationError(
      `Account is locked. Try again in ${remainingMinutes} minutes.`,
      { locked: true, remainingMinutes }
    );
  }

  // Verify password
  const isMatch = await verifyPassword(password, admin.password);
  if (!isMatch) {
    // Increment failed attempts
    admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;

    // Lock account if max attempts reached
    if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      await admin.save();
      
      throw new AuthenticationError(
        `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
        { locked: true }
      );
    }

    await admin.save();
    const remainingAttempts = MAX_FAILED_ATTEMPTS - admin.failedLoginAttempts;
    throw new AuthenticationError(
      `Invalid credentials. ${remainingAttempts} attempt(s) remaining.`,
      { remainingAttempts }
    );
  }

  // Generate tokens
  const accessToken = generateAccessToken(admin._id.toString());
  const refreshToken = generateRefreshToken(admin._id.toString());

  // Update admin state
  admin.isLoggedIn = true;
  admin.refreshToken = refreshToken;
  admin.failedLoginAttempts = 0;
  admin.lockedUntil = undefined;
  await admin.save();

  return {
    admin,
    tokens: { accessToken, refreshToken },
  };
};

/**
 * Validate access token
 */
export const validateToken = async (token: string): Promise<ValidationResult> => {
  if (!process.env.JWT_SECRET) {
    return { valid: false, error: 'Server configuration error' };
  }

  // Check if token is revoked
  if (await isTokenBlocked(token)) {
    return { valid: false, error: 'Token has been revoked' };
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    const admin = await Admin.findOne({ _id: verified.id });
    
    if (!admin || !admin.isLoggedIn) {
      return { valid: false, error: 'Authorization denied' };
    }

    return { valid: true, admin };
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token has expired' };
    }
    return { valid: false, error: 'Invalid token' };
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const verified = jwt.verify(refreshToken, getRefreshSecret()) as { id: string };
  const admin = await Admin.findOne({ _id: verified.id, refreshToken });

  if (!admin) {
    throw new AuthenticationError('Invalid Refresh Token');
  }

  const newAccessToken = generateAccessToken(admin._id.toString());
  const newRefreshToken = generateRefreshToken(admin._id.toString());

  admin.refreshToken = newRefreshToken;
  await admin.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Logout user and invalidate tokens
 */
export const logoutAdmin = async (adminId: string, token: string): Promise<void> => {
  // Add token to blocklist
  if (token) {
    await addToBlocklist(token);
  }

  // Update admin state
  await Admin.findByIdAndUpdate(adminId, {
    isLoggedIn: false,
    refreshToken: null,
  });
};

/**
 * Unlock a locked admin account
 */
export const unlockAccount = async (adminId: string): Promise<void> => {
  await Admin.findByIdAndUpdate(adminId, {
    failedLoginAttempts: 0,
    lockedUntil: undefined,
  });
};

/**
 * Update admin password
 */
export const updatePassword = async (adminId: string, newPassword: string): Promise<void> => {
  if (!newPassword || newPassword.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long');
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new NotFoundError('Admin not found', 'Admin');
  }

  admin.password = admin.generateHash(newPassword);
  await admin.save();
};