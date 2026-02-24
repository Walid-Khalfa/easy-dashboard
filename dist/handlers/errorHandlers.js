"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionErrors = exports.developmentErrors = exports.notFound = exports.catchErrors = void 0;
const catchErrors = (fn) => {
    return function (req, res, next) {
        const resp = fn(req, res, next);
        if (resp instanceof Promise) {
            return resp.catch(next);
        }
        return resp;
    };
};
exports.catchErrors = catchErrors;
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Api url doesn't exist ",
    });
};
exports.notFound = notFound;
const developmentErrors = (err, req, res, next) => {
    err.stack = err.stack || "";
    const errorDetails = {
        message: err.message,
        status: err.status || 500,
        stack: err.stack,
    };
    res.status(errorDetails.status).json({
        success: false,
        message: errorDetails.message,
        error: errorDetails
    });
};
exports.developmentErrors = developmentErrors;
const productionErrors = (err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};
exports.productionErrors = productionErrors;
