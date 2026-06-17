import { Request, Response } from "express";
import Course from "../models/Course.model";
import Session from "../models/Session.model";
import Enrollment from "../models/Enrollment.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";

export async function getCourses(req: Request, res: Response): Promise<void> {
  const studentId = req.user!.id;

  const [courses, enrollments] = await Promise.all([
    Course.find({ isActive: true }).sort({ createdAt: -1 }),
    Enrollment.find({ studentId }),
  ]);

  const enrollmentMap = new Map(
    enrollments.map((e) => [String(e.courseId), e.status])
  );

  const data = courses.map((course) => ({
    ...course.toJSON(),
    enrollmentStatus: enrollmentMap.get(String(course._id)) ?? null,
  }));

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Courses retrieved",
    data,
  };
  res.status(200).json(response);
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const studentId = req.user!.id;
  const { id } = req.params;

  const [course, enrollment, sessions] = await Promise.all([
    Course.findById(id),
    Enrollment.findOne({ studentId, courseId: id }),
    Session.find({ courseId: id }).sort({ order: 1 }),
  ]);

  if (!course || !course.isActive) {
    throw new AppError(404, "Course not found");
  }

  const isApproved = enrollment?.status === "approved";

  const sessionList = sessions.map((s) => ({
    _id: s._id,
    lessonNumber: s.lessonNumber,
    title: s.title,
    description: isApproved ? s.description : undefined,
    order: s.order,
    locked: !isApproved,
  }));

  const data = {
    ...course.toJSON(),
    enrollmentStatus: enrollment?.status ?? null,
    sessions: sessionList,
  };

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Course retrieved",
    data,
  };
  res.status(200).json(response);
}
