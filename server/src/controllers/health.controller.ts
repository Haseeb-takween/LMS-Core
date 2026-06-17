import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../types";

const DB_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function getHealth(_req: Request, res: Response): void {
  const dbState = mongoose.connection.readyState;
  const response: ApiResponse<{
    uptime: number;
    timestamp: string;
    database: string;
  }> = {
    success: true,
    message: "Server is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: DB_STATES[dbState] ?? "unknown",
    },
  };
  res.status(200).json(response);
}
