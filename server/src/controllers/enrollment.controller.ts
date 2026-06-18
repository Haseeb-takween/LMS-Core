import { Request, Response } from "express";
import Enrollment from "../models/Enrollment.model";
import Course from "../models/Course.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";
import mongoose from "mongoose";

export async function requestEnrollment(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { courseId } = req.body as { courseId?: string };

  if (!courseId) {
    throw new AppError(400, "courseId is required");
  }

  const course = await Course.findById(courseId);
  if (!course || !course.isActive) {
    throw new AppError(404, "Course not found");
  }

  const existing = await Enrollment.findOne({ studentId, courseId });
  if (existing) {
    throw new AppError(409, "You have already requested enrollment for this course");
  }

  const enrollment = await Enrollment.create({ studentId, courseId });

  const response: ApiResponse<typeof enrollment> = {
    success: true,
    message: "Enrollment request submitted",
    data: enrollment,
  };
  res.status(201).json(response);
}

export async function getMyEnrollments(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;

  const enrollments = await Enrollment.find({ studentId })
    .populate("courseId", "title description schedule isActive")
    .sort({ requestedAt: -1 });

  const response: ApiResponse<typeof enrollments> = {
    success: true,
    message: "Enrollments retrieved",
    data: enrollments,
  };
  res.status(200).json(response);
}

export async function adminGetEnrollments(
  req: Request,
  res: Response
): Promise<void> {
  const { status } = req.query as { status?: string };

  const filter: Record<string, unknown> = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const enrollments = await Enrollment.find(filter)
    .populate("studentId", "name email")
    .populate("courseId", "title schedule")
    .sort({ requestedAt: -1 });

  const response: ApiResponse<typeof enrollments> = {
    success: true,
    message: "Enrollments retrieved",
    data: enrollments,
  };
  res.status(200).json(response);
}

export async function approveEnrollment(
  req: Request,
  res: Response
): Promise<void> {
  const adminId = req.user!.id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid enrollment ID");
  }

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    throw new AppError(404, "Enrollment not found");
  }
  if (enrollment.status !== "pending") {
    throw new AppError(400, `Enrollment is already ${enrollment.status}`);
  }

  enrollment.status = "approved";
  enrollment.processedAt = new Date();
  enrollment.processedBy = new mongoose.Types.ObjectId(adminId);
  await enrollment.save();

  const response: ApiResponse<typeof enrollment> = {
    success: true,
    message: "Enrollment approved",
    data: enrollment,
  };
  res.status(200).json(response);
}

export async function rejectEnrollment(
  req: Request,
  res: Response
): Promise<void> {
  const adminId = req.user!.id;
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid enrollment ID");
  }

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    throw new AppError(404, "Enrollment not found");
  }
  if (enrollment.status !== "pending") {
    throw new AppError(400, `Enrollment is already ${enrollment.status}`);
  }

  enrollment.status = "rejected";
  enrollment.processedAt = new Date();
  enrollment.processedBy = new mongoose.Types.ObjectId(adminId);
  await enrollment.save();

  const response: ApiResponse<typeof enrollment> = {
    success: true,
    message: "Enrollment rejected",
    data: enrollment,
  };
  res.status(200).json(response);
}
