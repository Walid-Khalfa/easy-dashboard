"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.deleteAdmin = exports.updatePassword = exports.update = exports.create = exports.read = exports.profile = exports.list = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const list = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    try {
        const resultsPromise = Admin_1.default.find({ removed: false })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: "desc" })
            .select('-password');
        const countPromise = Admin_1.default.countDocuments({ removed: false });
        const [result, count] = await Promise.all([resultsPromise, countPromise]);
        const pages = Math.ceil(count / limit);
        const pagination = { page, pages, count };
        if (count > 0) {
            return res.status(200).json({
                success: true,
                result,
                pagination,
                message: "Successfully found all documents",
            });
        }
        else {
            return res.status(203).json({
                success: false,
                result: [],
                pagination,
                message: "Collection is Empty",
            });
        }
    }
    catch {
        return res.status(500).json({ success: false, result: [], message: "Oops there is an Error" });
    }
};
exports.list = list;
const profile = async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(404).json({
                success: false,
                result: null,
                message: "couldn't find admin Profile",
            });
        }
        const { _id, enabled, email, name, surname, role } = req.admin;
        return res.status(200).json({
            success: true,
            result: { _id, enabled, email, name, surname, role },
            message: "Successfully found Profile",
        });
    }
    catch {
        return res.status(500).json({ success: false, message: "Oops there is an Error" });
    }
};
exports.profile = profile;
const read = async (req, res) => {
    try {
        const tmpResult = await Admin_1.default.findOne({ _id: req.params.id, removed: false }).select('-password');
        if (!tmpResult) {
            return res.status(404).json({ success: false, message: "No document found by this id" });
        }
        return res.status(200).json({
            success: true,
            result: tmpResult,
            message: "we found this document by this id",
        });
    }
    catch {
        return res.status(500).json({ success: false, message: "Oops there is an Error" });
    }
};
exports.read = read;
const create = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email or password fields are required." });
        }
        const existingAdmin = await Admin_1.default.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }
        const newAdmin = new Admin_1.default(req.body);
        newAdmin.password = newAdmin.generateHash(password);
        const result = await newAdmin.save();
        const resultObject = result.toObject();
        // @ts-ignore
        delete resultObject.password;
        return res.status(200).json({
            success: true,
            result: resultObject,
            message: "Admin document saved correctly",
        });
    }
    catch {
        return res.status(500).json({ success: false, message: "there is error" });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const existingAdmin = await Admin_1.default.findOne({ email });
            if (existingAdmin && existingAdmin._id.toString() !== req.params.id) {
                return res.status(400).json({ success: false, message: "An account with this email already exists." });
            }
        }
        const result = await Admin_1.default.findOneAndUpdate({ _id: req.params.id, removed: false }, { $set: req.body }, { new: true, runValidators: true }).select('-password');
        if (!result) {
            return res.status(404).json({ success: false, message: "No document found by this id" });
        }
        return res.status(200).json({
            success: true,
            result,
            message: "we update this document by this id",
        });
    }
    catch {
        return res.status(500).json({ success: false, message: "Oops there is an Error" });
    }
};
exports.update = update;
const updatePassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
        }
        const admin = await Admin_1.default.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }
        admin.password = admin.generateHash(password);
        await admin.save();
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch {
        return res.status(500).json({ success: false, message: "Oops there is an Error" });
    }
};
exports.updatePassword = updatePassword;
const deleteAdmin = async (req, res) => {
    try {
        const result = await Admin_1.default.findOneAndUpdate({ _id: req.params.id, removed: false }, { $set: { removed: true } }, { new: true });
        if (!result) {
            return res.status(404).json({ success: false, message: "No document found" });
        }
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    }
    catch {
        return res.status(500).json({ success: false, message: "Oops there is an Error" });
    }
};
exports.deleteAdmin = deleteAdmin;
const search = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(202).json({ success: false, result: [] });
        }
        const fieldsArray = (req.query.fields || "name,surname,email").split(",");
        const fields = { $or: fieldsArray.map(field => ({ [field]: { $regex: new RegExp(query, "i") } })), removed: false };
        const result = await Admin_1.default.find(fields).select('-password').limit(10);
        return res.status(200).json({ success: true, result });
    }
    catch {
        return res.status(500).json({ success: false, result: [] });
    }
};
exports.search = search;
