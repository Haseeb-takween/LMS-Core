import { Request, Response, NextFunction } from "express";
import { ROLES } from "../constants/auth";
import { AppError } from "./errorHandler";

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== ROLES.ADMIN) {
    return next(new AppError(403, "Forbidden — admin access required"));
  }
  next();
}
