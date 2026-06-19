import { Request, Response, NextFunction } from "express";
import { COOKIE_NAME } from "../constants/auth";
import { verifyToken } from "../utils/jwt";
import { AppError } from "./errorHandler";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies?.[COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError(401, "Not authenticated — no token provided");
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
    } else {
      next(new AppError(401, "Not authenticated — invalid or expired token"));
    }
  }
}
