import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import logger from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  logger.error(message, err);

  const response: ApiResponse = { success: false, message, error: err.name };
  res.status(statusCode).json(response);
}

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Route not found"));
}
