import { Request, Response } from "express";
import User from "../models/User.model";
import { comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { COOKIE_NAME, cookieOptions, ROLES } from "../constants/auth";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as Record<string, string | undefined>;

  if (!email || !password) {
    throw new AppError(401, "Invalid credentials");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const match = user ? await comparePassword(password, user.password) : false;
  if (!user || !match) {
    throw new AppError(401, "Invalid credentials");
  }

  if (user.role !== ROLES.ADMIN) {
    throw new AppError(403, "Access denied — admin only");
  }

  const token = signToken({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  });

  res.cookie(COOKIE_NAME, token, cookieOptions);

  const response: ApiResponse<{ name: string; email: string; role: string }> = {
    success: true,
    message: "Admin login successful",
    data: { name: user.name, email: user.email, role: user.role },
  };
  res.status(200).json(response);
}

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await User.find({ role: ROLES.USER }).sort({ createdAt: -1 });

  const response: ApiResponse<typeof users> = {
    success: true,
    message: "Users retrieved",
    data: users,
  };
  res.status(200).json(response);
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const [totalUsers, totalAdmins, latestUser] = await Promise.all([
    User.countDocuments({ role: ROLES.USER }),
    User.countDocuments({ role: ROLES.ADMIN }),
    User.findOne({ role: ROLES.USER })
      .sort({ createdAt: -1 })
      .select("name email createdAt"),
  ]);

  const response: ApiResponse<{
    totalUsers: number;
    totalAdmins: number;
    latestJoin: string | null;
  }> = {
    success: true,
    message: "Stats retrieved",
    data: {
      totalUsers,
      totalAdmins,
      latestJoin: latestUser ? latestUser.createdAt.toISOString() : null,
    },
  };
  res.status(200).json(response);
}
