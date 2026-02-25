import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin';
import { addToBlocklist, isTokenBlocked } from '../utils/tokenBlocklist';

const generateAccessToken = (adminId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

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

const generateRefreshToken = (adminId: string) => {
  return jwt.sign({ id: adminId }, getRefreshSecret(), { expiresIn: '7d' });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, surname } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      email,
      password: passwordHash,
      name,
      surname,
    });
    const savedAdmin = await newAdmin.save();

    res.status(200).json({
      success: true,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        surname: savedAdmin.surname,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Account lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Check if account is currently locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        locked: true,
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      // Increment failed login attempts
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;

      // Lock account if max attempts reached
      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
        await admin.save();

        return res.status(423).json({
          success: false,
          message: `Account locked due to too many failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`,
          locked: true,
        });
      }

      await admin.save();

      const remainingAttempts = MAX_FAILED_ATTEMPTS - admin.failedLoginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${remainingAttempts} attempt(s) remaining before account lockout.`,
        remainingAttempts,
      });
    }

    // Clear lockout on successful login
    const accessToken = generateAccessToken(admin._id.toString());
    const refreshToken = generateRefreshToken(admin._id.toString());

    admin.isLoggedIn = true;
    admin.refreshToken = refreshToken;
    admin.failedLoginAttempts = 0;
    admin.lockedUntil = undefined;
    await admin.save();

    res.cookie('token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.json({
      success: true,
      result: {
        token: accessToken,
        refreshToken: refreshToken,
        admin: {
          id: admin._id,
          name: admin.name,
          isLoggedIn: admin.isLoggedIn,
        },
      },
      message: 'Successfully logged in admin',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ success: false, message: 'Refresh Token is required' });

  try {
    const verified = jwt.verify(refreshToken, getRefreshSecret()) as { id: string };
    const admin = await Admin.findOne({ _id: verified.id, refreshToken });

    if (!admin) return res.status(401).json({ success: false, message: 'Invalid Refresh Token' });

    const newAccessToken = generateAccessToken(admin._id.toString());
    const newRefreshToken = generateRefreshToken(admin._id.toString());

    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.cookie('token', newAccessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.json({
      success: true,
      result: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired Refresh Token' });
  }
};

export const isValidToken = async (req: any, res: Response, next: NextFunction) => {
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: JWT_SECRET not defined',
    });
  }

  try {
    const token = req.cookies?.token || req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token, authorization denied.',
        jwtExpired: true,
      });
    }

    if (await isTokenBlocked(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked.',
        jwtExpired: true,
      });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Token verification failed, authorization denied.',
        jwtExpired: true,
      });
    }

    const admin = await Admin.findOne({ _id: verified.id });
    if (!admin || !admin.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: 'Authorization denied.',
        jwtExpired: true,
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        jwtExpired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      jwtExpired: true,
    });
  }
};

export const logout = async (req: any, res: Response) => {
  const token = req.cookies?.token || req.header('x-auth-token');
  if (token) {
    await addToBlocklist(token);
  }

  const admin = await Admin.findOneAndUpdate(
    { _id: req.admin._id },
    { isLoggedIn: false, refreshToken: null },
    { new: true }
  ).exec();

  res.clearCookie('token');
  res.clearCookie('refreshToken');

  res.status(200).json({ success: true, isLoggedIn: admin?.isLoggedIn });
};
