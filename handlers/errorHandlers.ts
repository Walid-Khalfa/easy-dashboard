import { Request, Response, NextFunction } from 'express';

export const catchErrors = (fn: Function) => {
  return function (req: Request, res: Response, next: NextFunction) {
    const resp = fn(req, res, next);
    if (resp instanceof Promise) {
      return resp.catch(next);
    }
    return resp;
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Api url doesn't exist ",
  });
};

export const developmentErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
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

export const productionErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
