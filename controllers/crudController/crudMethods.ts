import { Request, Response } from 'express';
import { Model, Document } from 'mongoose';

export const read = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  try {
    const result = await Model.findOne({ _id: req.params.id, removed: false } as any);
    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No document found by this id",
      });
    }
    return res.status(200).json({
      success: true,
      result,
      message: "Document found",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Error retrieving document",
    });
  }
};

export const create = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  try {
    const result = await new Model(req.body).save();
    return res.status(201).json({
      success: true,
      result,
      message: "Document created successfully",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Validation failed",
        errors: err.errors
      });
    }
    return res.status(500).json({
      success: false,
      result: null,
      message: "Error creating document",
    });
  }
};

export const update = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false } as any,
      req.body,
      { new: true, runValidators: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No document found by this id",
      });
    }

    return res.status(200).json({
      success: true,
      result,
      message: "Document updated successfully",
    });
  } catch (err: any) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        result: null,
        message: "Validation failed",
        errors: err.errors
      });
    }
    return res.status(500).json({
      success: false,
      result: null,
      message: "Error updating document",
    });
  }
};

export const deleteItem = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  try {
    const result = await Model.findOneAndUpdate(
      { _id: req.params.id, removed: false } as any,
      { removed: true } as any,
      { new: true }
    ).exec();

    if (!result) {
      return res.status(404).json({
        success: false,
        result: null,
        message: "No document found by this id",
      });
    }
    return res.status(200).json({
      success: true,
      result,
      message: "Document deleted successfully",
    });
  } catch {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Error deleting document",
    });
  }
};

export const list = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.items as string) || 10;
  const skip = (page - 1) * limit;

  const queryObj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'items', 'fields', 'q'];
  excludeFields.forEach(el => delete queryObj[el]);

  const query = { ...queryObj, removed: false };

  try {
    const resultsPromise = Model.find(query as any)
      .skip(skip)
      .limit(limit)
      .sort((req.query.sort as string) || { created: "desc" });

    const countPromise = Model.countDocuments(query as any);
    const [result, count] = await Promise.all([resultsPromise, countPromise]);

    const pages = Math.ceil(count / limit);
    const pagination = { page, pages, count, limit };

    return res.status(200).json({
      success: true,
      result,
      pagination,
      message: count > 0 ? "Documents found" : "Collection is empty",
    });
  } catch {
    return res.status(500).json({
      success: false,
      result: [],
      message: "Error retrieving list",
    });
  }
};

export const search = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.trim() === "") {
    return res.status(200).json({
      success: true,
      result: [],
      message: "Query is empty",
    });
  }

  const fieldsArray = (req.query.fields as string || "name").split(",");
  const searchFields: any = { $or: [] };

  for (const field of fieldsArray) {
    searchFields.$or.push({ [field]: { $regex: new RegExp(q, "i") } });
  }

  searchFields.removed = false;

  try {
    const results = await Model.find(searchFields).sort({ name: "asc" } as any).limit(10);

    return res.status(200).json({
      success: true,
      result: results,
      message: results.length > 0 ? "Documents found" : "No documents match search",
    });
  } catch {
    return res.status(500).json({
      success: false,
      result: null,
      message: "Error during search",
    });
  }
};
