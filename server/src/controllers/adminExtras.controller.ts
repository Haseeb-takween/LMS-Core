import { Request, Response } from "express";
import mongoose from "mongoose";
import Course from "../models/Course.model";
import Session from "../models/Session.model";
import Enrollment from "../models/Enrollment.model";
import Attendance from "../models/Attendance.model";
import QuizSubmission from "../models/QuizSubmission.model";
import Quiz from "../models/Quiz.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";

export async function getCourseRoster(
  req: Request,
  res: Response
): Promise<void> {
  const { courseId } = req.params as { courseId: string };

  if (!mongoose.isValidObjectId(courseId)) {
    throw new AppError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new AppError(404, "Course not found");

  const [sessions, enrollments] = await Promise.all([
    Session.find({ courseId }).sort({ order: 1 }),
    Enrollment.find({ courseId, status: "approved" }).populate(
      "studentId",
      "name email"
    ),
  ]);

  const enrollmentIds = enrollments.map((e) => e._id);
  const attendanceRecords = await Attendance.find({
    enrollmentId: { $in: enrollmentIds },
  });

  // Map: enrollmentId → sessionId → status
  const attendanceMap = new Map<string, Map<string, string>>();
  for (const a of attendanceRecords) {
    const eid = String(a.enrollmentId);
    if (!attendanceMap.has(eid)) attendanceMap.set(eid, new Map());
    attendanceMap.get(eid)!.set(String(a.sessionId), a.status);
  }

  const students = enrollments.map((enrollment) => {
    const sessionMap = attendanceMap.get(String(enrollment._id)) ?? new Map();
    const attended = [...sessionMap.values()].filter((s) => s === "attended").length;
    const attendancePercent =
      sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;

    const grid: Record<string, string | null> = {};
    for (const s of sessions) {
      grid[String(s._id)] = sessionMap.get(String(s._id)) ?? null;
    }

    return {
      student: enrollment.studentId,
      enrollmentId: enrollment._id,
      attendance: grid,
      attendancePercent,
    };
  });

  const data = {
    course,
    sessions: sessions.map((s) => ({
      _id: s._id,
      lessonNumber: s.lessonNumber,
      title: s.title,
      order: s.order,
    })),
    students,
  };

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Roster retrieved",
    data,
  };
  res.status(200).json(response);
}

export async function adminGetAttendance(
  req: Request,
  res: Response
): Promise<void> {
  const {
    courseId,
    studentId,
    sortBy = "name",
    order = "asc",
  } = req.query as {
    courseId?: string;
    studentId?: string;
    sortBy?: string;
    order?: string;
  };

  const enrollmentFilter: Record<string, unknown> = { status: "approved" };
  if (courseId && mongoose.isValidObjectId(courseId)) {
    enrollmentFilter.courseId = new mongoose.Types.ObjectId(courseId);
  }
  if (studentId && mongoose.isValidObjectId(studentId)) {
    enrollmentFilter.studentId = new mongoose.Types.ObjectId(studentId);
  }

  const enrollments = await Enrollment.find(enrollmentFilter)
    .populate("studentId", "name email")
    .populate("courseId", "title");

  const results = await Promise.all(
    enrollments.map(async (enrollment) => {
      const [totalSessions, attendedCount] = await Promise.all([
        Session.countDocuments({ courseId: enrollment.courseId }),
        Attendance.countDocuments({ enrollmentId: enrollment._id, status: "attended" }),
      ]);

      const attendancePercent =
        totalSessions > 0
          ? Math.round((attendedCount / totalSessions) * 100)
          : 0;

      return {
        enrollmentId: enrollment._id,
        student: enrollment.studentId,
        course: enrollment.courseId,
        attendancePercent,
        attendedCount,
        totalSessions,
        enrolledAt: enrollment.requestedAt,
      };
    })
  );

  const sorted = results.sort((a, b) => {
    const dir = order === "desc" ? -1 : 1;
    if (sortBy === "attendancePercent") {
      return (a.attendancePercent - b.attendancePercent) * dir;
    }
    const nameA =
      typeof a.student === "object" && a.student !== null && "name" in a.student
        ? String((a.student as { name: string }).name)
        : "";
    const nameB =
      typeof b.student === "object" && b.student !== null && "name" in b.student
        ? String((b.student as { name: string }).name)
        : "";
    return nameA.localeCompare(nameB) * dir;
  });

  const response: ApiResponse<typeof sorted> = {
    success: true,
    message: "Attendance overview retrieved",
    data: sorted,
  };
  res.status(200).json(response);
}

export async function adminGetQuizResults(
  req: Request,
  res: Response
): Promise<void> {
  const { courseId, studentId } = req.query as {
    courseId?: string;
    studentId?: string;
  };

  const filter: Record<string, unknown> = {};
  if (courseId && mongoose.isValidObjectId(courseId)) {
    filter.courseId = new mongoose.Types.ObjectId(courseId);
  }
  if (studentId && mongoose.isValidObjectId(studentId)) {
    filter.studentId = new mongoose.Types.ObjectId(studentId);
  }

  const submissions = await QuizSubmission.find(filter)
    .populate("studentId", "name email")
    .populate("sessionId", "lessonNumber title order")
    .populate("courseId", "title")
    .sort({ courseId: 1, "sessionId.order": 1 });

  const enriched = await Promise.all(
    submissions.map(async (sub) => {
      const quiz = await Quiz.findOne({ sessionId: sub.sessionId });

      const questionMap = new Map(
        (quiz?.questions ?? []).map((q) => [String(q._id), q])
      );

      const answers = sub.answers.map((a) => {
        const question = questionMap.get(String(a.questionId));
        return {
          questionId: a.questionId,
          questionText: question?.text ?? "Unknown question",
          type: a.type,
          answer: a.answer,
          isCorrect: a.isCorrect,
          correctAnswer: a.type === "mc" ? question?.correctAnswer : undefined,
        };
      });

      return {
        _id: sub._id,
        student: sub.studentId,
        course: sub.courseId,
        session: sub.sessionId,
        mcScore: sub.mcScore,
        mcTotal: sub.mcTotal,
        submittedAt: sub.submittedAt,
        answers,
      };
    })
  );

  const response: ApiResponse<typeof enriched> = {
    success: true,
    message: "Quiz results retrieved",
    data: enriched,
  };
  res.status(200).json(response);
}
