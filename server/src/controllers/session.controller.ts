import { Request, Response } from "express";
import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.model";
import Session from "../models/Session.model";
import Quiz from "../models/Quiz.model";
import Attendance from "../models/Attendance.model";
import QuizSubmission from "../models/QuizSubmission.model";
import { AppError } from "../middlewares/errorHandler";
import { ApiResponse } from "../types";
import { checkEligibility } from "../utils/eligibility";

async function resolveEnrollment(enrollmentId: string, studentId: string) {
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

export async function getEnrollmentSessions(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId } = req.params as { id: string };

  const enrollment = await resolveEnrollment(enrollmentId, studentId);

  const [sessions, attendanceRecords, submissions] = await Promise.all([
    Session.find({ courseId: enrollment.courseId }).sort({ order: 1 }),
    Attendance.find({ enrollmentId }),
    QuizSubmission.find({ enrollmentId }),
  ]);

  const attendanceMap = new Map(
    attendanceRecords.map((a) => [String(a.sessionId), a.status])
  );
  const submissionMap = new Map(
    submissions.map((s) => [
      String(s.sessionId),
      { mcScore: s.mcScore, mcTotal: s.mcTotal },
    ])
  );

  const data = sessions.map((s) => {
    const submission = submissionMap.get(String(s._id));
    return {
      _id: s._id,
      lessonNumber: s.lessonNumber,
      title: s.title,
      description: s.description,
      order: s.order,
      attendanceStatus: attendanceMap.get(String(s._id)) ?? null,
      quizSubmitted: !!submission,
      quizScore: submission
        ? { mcScore: submission.mcScore, mcTotal: submission.mcTotal }
        : null,
    };
  });

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Sessions retrieved",
    data,
  };
  res.status(200).json(response);
}

export async function getEnrollmentSession(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId, sessionId } = req.params as { id: string; sessionId: string };

  const enrollment = await resolveEnrollment(enrollmentId, studentId);

  if (!mongoose.isValidObjectId(sessionId)) {
    throw new AppError(400, "Invalid session ID");
  }

  const [session, quiz, submission, attendance] = await Promise.all([
    Session.findOne({ _id: sessionId, courseId: enrollment.courseId }),
    Quiz.findOne({ sessionId }),
    QuizSubmission.findOne({ enrollmentId, sessionId }),
    Attendance.findOne({ enrollmentId, sessionId }),
  ]);

  if (!session) throw new AppError(404, "Session not found");

  const questions = quiz
    ? quiz.questions
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          _id: q._id,
          type: q.type,
          text: q.text,
          options: q.options,
          order: q.order,
          ...(submission ? { correctAnswer: q.correctAnswer } : {}),
        }))
    : [];

  const data = {
    _id: session._id,
    lessonNumber: session.lessonNumber,
    title: session.title,
    description: session.description,
    order: session.order,
    attendanceStatus: attendance?.status ?? null,
    quiz: quiz
      ? {
          _id: quiz._id,
          questions,
        }
      : null,
    submission: submission
      ? {
          answers: submission.answers,
          mcScore: submission.mcScore,
          mcTotal: submission.mcTotal,
          submittedAt: submission.submittedAt,
        }
      : null,
  };

  const response: ApiResponse<typeof data> = {
    success: true,
    message: "Session retrieved",
    data,
  };
  res.status(200).json(response);
}

export async function submitQuiz(
  req: Request,
  res: Response
): Promise<void> {
  const studentId = req.user!.id;
  const { id: enrollmentId, sessionId } = req.params as { id: string; sessionId: string };
  const { answers } = req.body as {
    answers?: { questionId: string; answer: string }[];
  };

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new AppError(400, "answers array is required");
  }

  const enrollment = await resolveEnrollment(enrollmentId, studentId);

  if (!mongoose.isValidObjectId(sessionId)) {
    throw new AppError(400, "Invalid session ID");
  }

  const [session, quiz, existing] = await Promise.all([
    Session.findOne({ _id: sessionId, courseId: enrollment.courseId }),
    Quiz.findOne({ sessionId }),
    QuizSubmission.findOne({ enrollmentId, sessionId }),
  ]);

  if (!session) throw new AppError(404, "Session not found");
  if (!quiz) throw new AppError(404, "No quiz found for this session");
  if (existing) throw new AppError(409, "Quiz already submitted");

  const questionMap = new Map(
    quiz.questions.map((q) => [String(q._id), q])
  );

  let mcScore = 0;
  let mcTotal = 0;

  const scoredAnswers = answers.map((a) => {
    const question = questionMap.get(a.questionId);
    if (!question) throw new AppError(400, `Unknown questionId: ${a.questionId}`);

    if (question.type === "mc") {
      mcTotal++;
      const isCorrect = a.answer === question.correctAnswer;
      if (isCorrect) mcScore++;
      return {
        questionId: new mongoose.Types.ObjectId(a.questionId),
        type: "mc" as const,
        answer: a.answer,
        isCorrect,
      };
    }

    return {
      questionId: new mongoose.Types.ObjectId(a.questionId),
      type: "short" as const,
      answer: a.answer,
    };
  });

  const submission = await QuizSubmission.create({
    enrollmentId: new mongoose.Types.ObjectId(enrollmentId),
    sessionId: new mongoose.Types.ObjectId(sessionId),
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
    answers: scoredAnswers,
    mcScore,
    mcTotal,
  });

  await checkEligibility(enrollmentId);

  const response: ApiResponse<typeof submission> = {
    success: true,
    message: "Quiz submitted",
    data: submission,
  };
  res.status(201).json(response);
}
