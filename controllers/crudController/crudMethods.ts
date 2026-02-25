import { Request, Response } from 'express';
import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { escapeRegex } from '../../utils/regexEscape';

/**
 * Validates that field names exist in the model schema
 * Prevents NoSQL injection through field parameter manipulation
 */
const validateFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model: Model<any>, 
  fields: string[]
): { valid: string[]; invalid: string[] } => {
  // Get schema paths from the model
  const schemaPaths = Object.keys(Model.schema.paths);
  const valid: string[] = [];
  const invalid: string[] = [];
  
  for (const field of fields) {
    const trimmedField = field.trim();
    if (schemaPaths.includes(trimmedField)) {
      valid.push(trimmedField);
    } else {
      invalid.push(trimmedField);
    }
  }
  
  return { valid, invalid };
};

/**
 * Filters request body to only include fields that exist in the model schema
 * Prevents mass assignment vulnerabilities by ignoring unknown fields
 */
const filterBodyBySchema = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Model: Model<any>,
  body: Record<string, unknown>
): Record<string, unknown> => {
  const schemaPaths = Object.keys(Model.schema.paths);
  const filteredBody: Record<string, unknown> = {};
  
  for (const key of Object.keys(body)) {
    // Only include fields that exist in the schema
    if (schemaPaths.includes(key)) {
      filteredBody[key] = body[key];
    }
  }
  
  return filteredBody;
};

export const read = async <T extends Document>(Model: Model<T>, req: Request, res: Response) => {
  try {
    const query: FilterQuery<T> = { _id: req.params.id, removed: false };
    const result = await Model.findOne(query);
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
    // Filter body to only include valid schema fields (prevents mass assignment)
    const filteredBody = filterBodyBySchema(Model, req.body);
    const result = await new Model(filteredBody).save();
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
    const query: FilterQuery<T> = { _id: req.params.id, removed: false };
    // Filter body to only include valid schema fields (prevents mass assignment)
    const filteredBody = filterBodyBySchema(Model, req.body);
    const update: UpdateQuery<T> = filteredBody;
    const result = await Model.findOneAndUpdate(
      query,
      update,
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
    const query: FilterQuery<T> = { _id: req.params.id, removed: false };
    const update: UpdateQuery<T> = { removed: true };
    const result = await Model.findOneAndUpdate(
      query,
      update,
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

  const query: FilterQuery<T> = { ...queryObj, removed: false } as FilterQuery<T>;

  try {
    const sortOption: Record<string, 1 | -1> = req.query.sort 
      ? { [req.query.sort as string]: 1 } 
      : { created: -1 };

    const resultsPromise = Model.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOption);

    const countPromise = Model.countDocuments(query);
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

  // Escape special regex characters to prevent ReDoS attacks
  const escapedQuery = escapeRegex(q.trim());
  
  // Limit query length for additional protection
  if (escapedQuery.length > 100) {
    return res.status(400).json({
      success: false,
      result: null,
      message: "Search query too long",
    });
  }

  const requestedFields = (req.query.fields as string || "name").split(",");
  
  // Validate field names against model schema to prevent injection
  const { valid: validFields, invalid: invalidFields } = validateFields(Model, requestedFields);
  
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: `Invalid search fields: ${invalidFields.join(", ")}`,
    });
  }
  
  if (validFields.length === 0) {
    return res.status(400).json({
      success: false,
      result: null,
      message: "No valid search fields provided",
    });
  }

  const searchFields: FilterQuery<T> = { $or: [] } as FilterQuery<T>;

  for (const field of validFields) {
    (searchFields.$or as Array<Record<string, { $regex: RegExp }>>).push({ 
      [field]: { $regex: new RegExp(escapedQuery, "i") } 
    });
  }

  (searchFields as Record<string, unknown>).removed = false;

  try {
    const results = await Model.find(searchFields).sort({ name: "asc" }).limit(10);

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
