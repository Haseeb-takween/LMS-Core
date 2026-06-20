import { Request, Response } from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Certificate from "../models/Certificate.model";
import Enrollment from "../models/Enrollment.model";
import Session from "../models/Session.model";
import Attendance from "../models/Attendance.model";
import QuizSubmission from "../models/QuizSubmission.model";
import Quiz from "../models/Quiz.model";
import User from "../models/User.model";
import Course from "../models/Course.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";

async function resolveStudentEnrollment(enrollmentId: string, studentId: string) {
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
  return enrollment;
}

export async function getEnrollmentCertificate(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId } = req.params as { id: string };

  const enrollment = await resolveStudentEnrollment(enrollmentId, studentId);

  const certificate = await Certificate.findOne({ enrollmentId });

  if (certificate) {
    const response: ApiResponse = {
      success: true,
      message: "Certificate retrieved",
      data: certificate,
    };
    res.status(200).json(response);
    return;
  }

  // No certificate yet — calculate current progress toward thresholds
  const [sessions, attendanceRecords, submissions] = await Promise.all([
    Session.find({ courseId: enrollment.courseId }),
    Attendance.find({ enrollmentId }),
    QuizSubmission.find({ enrollmentId }),
  ]);

  const quizSessions = await Quiz.find(
    { sessionId: { $in: sessions.map((s) => s._id) } },
    "sessionId"
  );

  const attended = attendanceRecords.filter((a) => a.status === "attended").length;
  const attendancePercent =
    sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;

  const totalQuizzable = quizSessions.length;
  const submittedSessionIds = new Set(submissions.map((s) => String(s.sessionId)));
  const quizzesSubmitted = quizSessions.filter((q) =>
    submittedSessionIds.has(String(q.sessionId))
  ).length;

  const totalCorrect = submissions.reduce((s, q) => s + q.mcScore, 0);
  const totalGraded = submissions.reduce((s, q) => s + q.mcTotal, 0);
  const quizAverage =
    totalQuizzable === 0 ? 100
    : totalGraded === 0 ? 0
    : Math.round((totalCorrect / totalGraded) * 100);

  const response: ApiResponse = {
    success: true,
    message: "Not yet eligible",
    data: {
      status: "not_eligible",
      attendancePercent,
      quizAverage,
      quizzesSubmitted,
      totalQuizzable,
      attendanceThreshold: 80,
      quizThreshold: 70,
    },
  };
  res.status(200).json(response);
}

export async function downloadCertificate(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId } = req.params as { id: string };

  await resolveStudentEnrollment(enrollmentId, studentId);

  const certificate = await Certificate.findOne({ enrollmentId });
  if (!certificate) throw new AppError(404, "Certificate not found");
  if (certificate.status !== "approved") {
    throw new AppError(403, "Certificate has not been approved yet");
  }

  const [student, course] = await Promise.all([
    User.findById(studentId),
    Course.findById(certificate.courseId),
  ]);

  if (!student || !course) throw new AppError(500, "Could not load certificate data");

  const approvedDate = certificate.approvedAt
    ? certificate.approvedAt.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 60 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${String(certificate._id)}.pdf"`
  );

  doc.pipe(res);

  // Border
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(3)
    .stroke("#1d4ed8");

  const cx = doc.page.width / 2;

  doc
    .font("Helvetica-Bold")
    .fontSize(36)
    .fillColor("#1d4ed8")
    .text("Certificate of Completion", 60, 80, { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#374151")
    .text("This is to certify that", { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(28)
    .fillColor("#111827")
    .text(student.name, { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica")
    .fontSize(14)
    .fillColor("#374151")
    .text("has successfully completed the course", { align: "center" });

  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#1d4ed8")
    .text(course.title, { align: "center" });

  doc
    .moveDown(1)
    .font("Helvetica")
    .fontSize(12)
    .fillColor("#6b7280")
    .text(
      `Attendance: ${certificate.attendancePercent}%   |   Quiz Average: ${certificate.quizAverage}%`,
      { align: "center" }
    );

  doc
    .moveDown(0.5)
    .fontSize(12)
    .fillColor("#6b7280")
    .text(`Issued on ${approvedDate}`, { align: "center" });

  // Underline for name — decorative line
  const nameY = 195;
  doc
    .moveTo(cx - 120, nameY)
    .lineTo(cx + 120, nameY)
    .lineWidth(1)
    .stroke("#d1d5db");

  doc.end();
}

// ── Admin handlers ──────────────────────────────────────────────────────────

export async function adminGetCertificates(
  req: Request,
  res: Response
): Promise<void> {
  const { status } = req.query as { status?: string };

  const filter: Record<string, unknown> = {};
  if (
    status &&
    ["pending_approval", "approved", "rejected"].includes(status)
  ) {
    filter.status = status;
  }

  const certificates = await Certificate.find(filter)
    .populate("studentId", "name email")
    .populate("courseId", "title schedule")
    .sort({ createdAt: -1 });

  const response: ApiResponse<typeof certificates> = {
    success: true,
    message: "Certificates retrieved",
    data: certificates,
  };
  res.status(200).json(response);
}

export async function approveCertificate(
  req: Request,
  res: Response
): Promise<void> {
  const adminId = req.user!.id;
  const { id } = req.params as { id: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid certificate ID");
  }

  const certificate = await Certificate.findById(id);
  if (!certificate) throw new AppError(404, "Certificate not found");
  if (certificate.status !== "pending_approval") {
    throw new AppError(400, `Certificate is already ${certificate.status}`);
  }

  certificate.status = "approved";
  certificate.approvedBy = new mongoose.Types.ObjectId(adminId);
  certificate.approvedAt = new Date();
  await certificate.save();

  const response: ApiResponse<typeof certificate> = {
    success: true,
    message: "Certificate approved",
    data: certificate,
  };
  res.status(200).json(response);
}

export async function rejectCertificate(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params as { id: string };
  const { reason } = req.body as { reason?: string };

  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, "Invalid certificate ID");
  }

  const certificate = await Certificate.findById(id);
  if (!certificate) throw new AppError(404, "Certificate not found");
  if (certificate.status !== "pending_approval") {
    throw new AppError(400, `Certificate is already ${certificate.status}`);
  }

  certificate.status = "rejected";
  certificate.rejectionReason = reason;
  await certificate.save();

  const response: ApiResponse<typeof certificate> = {
    success: true,
    message: "Certificate rejected",
    data: certificate,
  };
  res.status(200).json(response);
}
