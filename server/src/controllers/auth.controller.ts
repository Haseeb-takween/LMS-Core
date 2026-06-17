import { Request, Response } from "express";
import User from "../models/User.model";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { COOKIE_NAME, cookieOptions, clearCookieOptions } from "../constants/auth";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, confirmPassword } = req.body as Record<string, string | undefined>;

  if (!name || !email || !password || !confirmPassword) {
    throw new AppError(400, "All fields are required");
  }
  if (!email.includes("@")) {
    throw new AppError(400, "Invalid email address");
  }
  if (password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }
  if (password !== confirmPassword) {
    throw new AppError(400, "Passwords do not match");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError(400, "Email is already registered");
  }

  const hashed = await hashPassword(password);
  await User.create({ name, email, password: hashed });

  const response: ApiResponse = {
    success: true,
    message: "Registration successful",
  };
  res.status(201).json(response);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as Record<string, string | undefined>;

  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const match = user ? await comparePassword(password, user.password) : false;
  if (!user || !match) {
    throw new AppError(401, "Invalid email or password");
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
    message: "Login successful",
    data: { name: user.name, email: user.email, role: user.role },
  };
  res.status(200).json(response);
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME, clearCookieOptions);

  const response: ApiResponse = {
    success: true,
    message: "Logged out successfully",
  };
  res.status(200).json(response);
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const response: ApiResponse<{ name: string; email: string; role: string }> = {
    success: true,
    message: "Authenticated user",
    data: { name: user.name, email: user.email, role: user.role },
  };
  res.status(200).json(response);
}
