"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.list = exports.deleteItem = exports.update = exports.create = exports.read = void 0;
const read = async (Model, req, res) => {
    try {
        const result = await Model.findOne({ _id: req.params.id, removed: false });
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
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Error retrieving document",
        });
    }
};
exports.read = read;
const create = async (Model, req, res) => {
    try {
        const result = await new Model(req.body).save();
        return res.status(201).json({
            success: true,
            result,
            message: "Document created successfully",
        });
    }
    catch (err) {
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
exports.create = create;
const update = async (Model, req, res) => {
    try {
        const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, req.body, { new: true, runValidators: true }).exec();
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
    }
    catch (err) {
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
exports.update = update;
const deleteItem = async (Model, req, res) => {
    try {
        const result = await Model.findOneAndUpdate({ _id: req.params.id, removed: false }, { removed: true }, { new: true }).exec();
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
    }
    catch {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Error deleting document",
        });
    }
};
exports.deleteItem = deleteItem;
const list = async (Model, req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = (page - 1) * limit;
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'items', 'fields', 'q'];
    excludeFields.forEach(el => delete queryObj[el]);
    const query = { ...queryObj, removed: false };
    try {
        const resultsPromise = Model.find(query)
            .skip(skip)
            .limit(limit)
            .sort(req.query.sort || { created: "desc" });
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
    }
    catch {
        return res.status(500).json({
            success: false,
            result: [],
            message: "Error retrieving list",
        });
    }
};
exports.list = list;
const search = async (Model, req, res) => {
    const q = req.query.q;
    if (!q || q.trim() === "") {
        return res.status(200).json({
            success: true,
            result: [],
            message: "Query is empty",
        });
    }
    const fieldsArray = (req.query.fields || "name").split(",");
    const searchFields = { $or: [] };
    for (const field of fieldsArray) {
        searchFields.$or.push({ [field]: { $regex: new RegExp(q, "i") } });
    }
    searchFields.removed = false;
    try {
        const results = await Model.find(searchFields).sort({ name: "asc" }).limit(10);
        return res.status(200).json({
            success: true,
            result: results,
            message: results.length > 0 ? "Documents found" : "No documents match search",
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            result: null,
            message: "Error during search",
        });
    }
};
exports.search = search;
