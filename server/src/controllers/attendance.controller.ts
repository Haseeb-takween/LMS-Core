import { Request, Response } from "express";
import mongoose from "mongoose";
import Attendance from "../models/Attendance.model";
import Enrollment from "../models/Enrollment.model";
import Session from "../models/Session.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";
import { checkEligibility } from "../utils/eligibility";

export async function markAttendance(
  req: Request,
  res: Response
): Promise<void> {
  const adminId = req.user!.id;
  const { enrollmentId, sessionId, status } = req.body as {
    enrollmentId?: string;
    sessionId?: string;
    status?: string;
  };

  if (!enrollmentId || !sessionId || !status) {
    throw new AppError(400, "enrollmentId, sessionId and status are required");
  }
  if (!["attended", "missed"].includes(status)) {
    throw new AppError(400, "status must be 'attended' or 'missed'");
  }
  if (!mongoose.isValidObjectId(enrollmentId) || !mongoose.isValidObjectId(sessionId)) {
    throw new AppError(400, "Invalid enrollmentId or sessionId");
  }

  const [enrollment, session] = await Promise.all([
    Enrollment.findById(enrollmentId),
    Session.findById(sessionId),
  ]);

  if (!enrollment) throw new AppError(404, "Enrollment not found");
  if (enrollment.status !== "approved") {
    throw new AppError(400, "Cannot mark attendance for a non-approved enrollment");
  }
  if (!session) throw new AppError(404, "Session not found");
  if (String(session.courseId) !== String(enrollment.courseId)) {
    throw new AppError(400, "Session does not belong to this enrollment's course");
  }

  const attendance = await Attendance.findOneAndUpdate(
    { enrollmentId, sessionId },
    {
      enrollmentId: new mongoose.Types.ObjectId(enrollmentId),
      sessionId: new mongoose.Types.ObjectId(sessionId),
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status,
      markedBy: new mongoose.Types.ObjectId(adminId),
      markedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  await checkEligibility(enrollmentId);

  const response: ApiResponse<typeof attendance> = {
    success: true,
    message: "Attendance marked",
    data: attendance,
  };
  res.status(200).json(response);
}

export async function updateAttendance(
  req: Request,
  res: Response
): Promise<void> {
  const adminId = req.user!.id;
  const { id } = req.params as { id: string };
  const { status } = req.body as { status?: string };

  if (!status) throw new AppError(400, "status is required");
  if (!["attended", "missed"].includes(status)) {
    throw new AppError(400, "status must be 'attended' or 'missed'");
  }
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid attendance ID");
  }

  const attendance = await Attendance.findById(id);
  if (!attendance) throw new AppError(404, "Attendance record not found");

  attendance.status = status as "attended" | "missed";
  attendance.markedBy = new mongoose.Types.ObjectId(adminId);
  attendance.markedAt = new Date();
  await attendance.save();

  await checkEligibility(String(attendance.enrollmentId));

  const response: ApiResponse<typeof attendance> = {
    success: true,
    message: "Attendance updated",
    data: attendance,
  };
  res.status(200).json(response);
}

export async function getEnrollmentAttendance(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId } = req.params as { id: string };

  if (!mongoose.isValidObjectId(enrollmentId)) {
    throw new AppError(400, "Invalid enrollment ID");
  }

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) throw new AppError(404, "Enrollment not found");
  if (String(enrollment.studentId) !== studentId) {
    throw new AppError(403, "Access denied");
  }
  if (enrollment.status !== "approved") {
    throw new AppError(403, "Enrollment is not approved");
  }

  const [sessions, attendanceRecords] = await Promise.all([
    Session.find({ courseId: enrollment.courseId }).sort({ order: 1 }),
    Attendance.find({ enrollmentId }),
  ]);

  const attendanceMap = new Map(
    attendanceRecords.map((a) => [String(a.sessionId), a.status])
  );

  const attended = attendanceRecords.filter((a) => a.status === "attended").length;
  const attendancePercent =
    sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;

  const data = {
    attendancePercent,
    totalSessions: sessions.length,
    attendedCount: attended,
    sessions: sessions.map((s) => ({
      _id: s._id,
      lessonNumber: s.lessonNumber,
      title: s.title,
      order: s.order,
      status: attendanceMap.get(String(s._id)) ?? null,
    })),
  };

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Attendance retrieved",
    data,
  };
  res.status(200).json(response);
}
