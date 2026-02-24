"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.isValidToken = exports.refresh = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_1 = __importDefault(require("../models/Admin"));
const generateAccessToken = (adminId) => {
    return jsonwebtoken_1.default.sign({ id: adminId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
const generateRefreshToken = (adminId) => {
    return jsonwebtoken_1.default.sign({ id: adminId }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
};
const register = async (req, res) => {
    try {
        const { email, password, name, surname } = req.body;
        const existingAdmin = await Admin_1.default.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }
        const salt = await bcryptjs_1.default.genSalt();
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newAdmin = new Admin_1.default({
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin_1.default.findOne({ email });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: "No account with this email has been registered.",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, admin.password);
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken)
        return res.status(401).json({ success: false, message: "Refresh Token is required" });
    try {
        const verified = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const admin = await Admin_1.default.findOne({ _id: verified.id, refreshToken });
        if (!admin)
            return res.status(401).json({ success: false, message: "Invalid Refresh Token" });
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
    }
    catch (err) {
        res.status(401).json({ success: false, message: "Invalid or expired Refresh Token" });
    }
};
exports.refresh = refresh;
const isValidToken = async (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token)
            return res.status(401).json({
                success: false,
                message: "No authentication token, authorization denied.",
                jwtExpired: true,
            });
        const verified = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!verified)
            return res.status(401).json({
                success: false,
                message: "Token verification failed, authorization denied.",
                jwtExpired: true,
            });
        const admin = await Admin_1.default.findOne({ _id: verified.id });
        if (!admin || !admin.isLoggedIn)
            return res.status(401).json({
                success: false,
                message: "Authorization denied.",
                jwtExpired: true,
            });
        req.admin = admin;
        next();
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Token is invalid or expired",
            jwtExpired: true,
        });
    }
};
exports.isValidToken = isValidToken;
const logout = async (req, res) => {
    const admin = await Admin_1.default.findOneAndUpdate({ _id: req.admin._id }, { isLoggedIn: false, refreshToken: null }, { new: true }).exec();
    res.status(200).json({ success: true, isLoggedIn: admin?.isLoggedIn });
};
exports.logout = logout;
