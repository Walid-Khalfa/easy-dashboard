import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

const generateAccessToken = (adminId: string) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (adminId: string) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, surname } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "No account with this email has been registered.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const accessToken = generateAccessToken(admin._id.toString());
    const refreshToken = generateRefreshToken(admin._id.toString());

    admin.isLoggedIn = true;
    admin.refreshToken = refreshToken;
    await admin.save();

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
      message: "Successfully logged in admin",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh Token is required" });

  try {
    const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as { id: string };
    const admin = await Admin.findOne({ _id: verified.id, refreshToken });

    if (!admin) return res.status(401).json({ success: false, message: "Invalid Refresh Token" });

    const newAccessToken = generateAccessToken(admin._id.toString());
    const newRefreshToken = generateRefreshToken(admin._id.toString());

    admin.refreshToken = newRefreshToken;
    await admin.save();

    res.json({
      success: true,
      result: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      }
    });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired Refresh Token" });
  }
};

export const isValidToken = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.header("x-auth-token");
    if (!token)
      return res.status(401).json({
        success: false,
        message: "No authentication token, authorization denied.",
        jwtExpired: true,
      });

    const verified = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    if (!verified)
      return res.status(401).json({
        success: false,
        message: "Token verification failed, authorization denied.",
        jwtExpired: true,
      });

    const admin = await Admin.findOne({ _id: verified.id });
    if (!admin || !admin.isLoggedIn)
      return res.status(401).json({
        success: false,
        message: "Authorization denied.",
        jwtExpired: true,
      });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Token is invalid or expired",
      jwtExpired: true,
    });
  }
};

export const logout = async (req: any, res: Response) => {
  const admin = await Admin.findOneAndUpdate(
    { _id: req.admin._id },
    { isLoggedIn: false, refreshToken: null },
    { new: true }
  ).exec();

  res.status(200).json({ success: true, isLoggedIn: admin?.isLoggedIn });
};
