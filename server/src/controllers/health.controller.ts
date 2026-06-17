import { Request, Response } from "express";
import { ApiResponse } from "../types";

export function getHealth(_req: Request, res: Response): void {
  const response: ApiResponse<{ uptime: number; timestamp: string }> = {
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  };
  res.status(200).json(response);
}
