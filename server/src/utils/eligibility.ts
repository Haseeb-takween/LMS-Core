import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.model";
import Session from "../models/Session.model";
import Attendance from "../models/Attendance.model";
import QuizSubmission from "../models/QuizSubmission.model";
import Quiz from "../models/Quiz.model";
import Certificate from "../models/Certificate.model";

const ATTENDANCE_THRESHOLD = 80;
const QUIZ_THRESHOLD = 70;

export async function checkEligibility(enrollmentId: string): Promise<void> {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment || enrollment.status !== "approved") return;

  const sessions = await Session.find({ courseId: enrollment.courseId }, "_id");
  if (sessions.length === 0) return;

  const sessionIds = sessions.map((s) => s._id);

  const [attendedCount, submissions, quizSessions] = await Promise.all([
    Attendance.countDocuments({ enrollmentId, status: "attended" }),
    QuizSubmission.find({ enrollmentId }),
    Quiz.find({ sessionId: { $in: sessionIds } }, "sessionId"),
  ]);

  const totalSessions = sessions.length;
  const totalQuizzable = quizSessions.length;

  // Every session that has a quiz must be submitted before eligibility is checked
  if (totalQuizzable > 0) {
    const submittedSessionIds = new Set(submissions.map((s) => String(s.sessionId)));
    const allDone = quizSessions.every((q) => submittedSessionIds.has(String(q.sessionId)));
    if (!allDone) return;
  }

  const attendancePercent = Math.round((attendedCount / totalSessions) * 100);

  const totalCorrect = submissions.reduce((sum, s) => sum + s.mcScore, 0);
  const totalGraded = submissions.reduce((sum, s) => sum + s.mcTotal, 0);
  // If no quizzes exist in the course, waive the quiz requirement (100%)
  // If quizzes exist but all are short-answer (no MC), treat as 0% to avoid false eligibility
  const quizAverage =
    totalQuizzable === 0 ? 100
    : totalGraded === 0 ? 0
    : Math.round((totalCorrect / totalGraded) * 100);

  if (attendancePercent < ATTENDANCE_THRESHOLD || quizAverage < QUIZ_THRESHOLD) return;

  const existing = await Certificate.findOne({ enrollmentId });
  if (existing) {
    existing.attendancePercent = attendancePercent;
    existing.quizAverage = quizAverage;
    await existing.save();
    return;
  }

  await Certificate.create({
    enrollmentId: new mongoose.Types.ObjectId(enrollmentId),
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
    attendancePercent,
    quizAverage,
    status: "pending_approval",
  });
}
