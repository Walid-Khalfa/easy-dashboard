import { Request, Response } from 'express';
import Admin from '../models/Admin';
import { escapeRegex } from '../utils/regexEscape';

// Allowed search fields for Admin model (whitelist)
const ALLOWED_ADMIN_SEARCH_FIELDS = ['name', 'surname', 'email', 'role'];

export const list = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.items as string) || 10;
  const skip = page * limit - limit;
  try {
    const resultsPromise = Admin.find({ removed: false })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: "desc" })
      .select('-password');

    const countPromise = Admin.countDocuments({ removed: false });
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
    } else {
      return res.status(203).json({
        success: false,
        result: [],
        pagination,
        message: "Collection is Empty",
      });
    }
  } catch {
    return res.status(500).json({ success: false, result: [], message: "Oops there is an Error" });
  }
};

export const profile = async (req: any, res: Response) => {
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
  } catch {
    return res.status(500).json({ success: false, message: "Oops there is an Error" });
  }
};

export const read = async (req: Request, res: Response) => {
  try {
    const tmpResult = await Admin.findOne({ _id: req.params.id, removed: false }).select('-password');
    if (!tmpResult) {
      return res.status(404).json({ success: false, message: "No document found by this id" });
    }
    return res.status(200).json({
      success: true,
      result: tmpResult,
      message: "we found this document by this id",
    });
  } catch {
    return res.status(500).json({ success: false, message: "Oops there is an Error" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email or password fields are required." });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const newAdmin = new Admin(req.body);
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
  } catch {
    return res.status(500).json({ success: false, message: "there is error" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin && existingAdmin._id.toString() !== req.params.id) {
        return res.status(400).json({ success: false, message: "An account with this email already exists." });
      }
    }

    const result = await Admin.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!result) {
      return res.status(404).json({ success: false, message: "No document found by this id" });
    }
    return res.status(200).json({
      success: true,
      result,
      message: "we update this document by this id",
    });
  } catch {
    return res.status(500).json({ success: false, message: "Oops there is an Error" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    admin.password = admin.generateHash(password);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch {
    return res.status(500).json({ success: false, message: "Oops there is an Error" });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const result = await Admin.findOneAndUpdate(
      { _id: req.params.id, removed: false },
      { $set: { removed: true } },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ success: false, message: "No document found" });
    }
    return res.status(200).json({ success: true, message: "Successfully deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Oops there is an Error" });
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim() === "") {
      return res.status(202).json({ success: false, result: [] });
    }

    // Escape special regex characters to prevent ReDoS attacks
    const escapedQuery = escapeRegex(query.trim());
    
    // Limit query length for additional protection
    if (escapedQuery.length > 100) {
      return res.status(400).json({ 
        success: false, 
        result: [], 
        message: "Search query too long" 
      });
    }

    const requestedFields = (req.query.fields as string || "name,surname,email").split(",");
    
    // Validate field names against whitelist
    const validFields = requestedFields
      .map(f => f.trim())
      .filter(f => ALLOWED_ADMIN_SEARCH_FIELDS.includes(f));
    
    if (validFields.length === 0) {
      return res.status(400).json({ 
        success: false, 
        result: [], 
        message: "No valid search fields provided" 
      });
    }

    const fields = { 
      $or: validFields.map(field => ({ 
        [field]: { $regex: new RegExp(escapedQuery, "i") } 
      })), 
      removed: false 
    };

    const result = await Admin.find(fields).select('-password').limit(10);
    return res.status(200).json({ success: true, result });
  } catch {
    return res.status(500).json({ success: false, result: [] });
  }
};

export const unlockAccount = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = undefined;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Account unlocked successfully",
    });
  } catch {
    return res.status(500).json({ success: false, message: "Error unlocking account" });
  }
};
