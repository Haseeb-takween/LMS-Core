import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.model";
import Session from "../models/Session.model";
import Attendance from "../models/Attendance.model";
import QuizSubmission from "../models/QuizSubmission.model";
import Certificate from "../models/Certificate.model";

const ATTENDANCE_THRESHOLD = 80;
const QUIZ_THRESHOLD = 70;

export async function checkEligibility(enrollmentId: string): Promise<void> {
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment || enrollment.status !== "approved") return;

  const [totalSessions, attendedCount, submissions] = await Promise.all([
    Session.countDocuments({ courseId: enrollment.courseId }),
    Attendance.countDocuments({ enrollmentId, status: "attended" }),
    QuizSubmission.find({ enrollmentId }),
  ]);

  if (totalSessions === 0) return;

  const attendancePercent = Math.round((attendedCount / totalSessions) * 100);

  const totalCorrect = submissions.reduce((sum, s) => sum + s.mcScore, 0);
  const totalGraded = submissions.reduce((sum, s) => sum + s.mcTotal, 0);
  const quizAverage =
    totalGraded === 0
      ? 100
      : Math.round((totalCorrect / totalGraded) * 100);

  if (attendancePercent < ATTENDANCE_THRESHOLD || quizAverage < QUIZ_THRESHOLD) {
    return;
  }

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
