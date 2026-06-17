import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type AttendanceStatus = "attended" | "missed";

export interface IAttendance {
  enrollmentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  markedAt: Date;
}

export type AttendanceDocument = IAttendance & Document;

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["attended", "missed"],
      required: true,
    },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    markedAt: { type: Date, default: () => new Date() },
  },
  {
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

attendanceSchema.index({ enrollmentId: 1, sessionId: 1 }, { unique: true });

const Attendance: Model<AttendanceDocument> =
  mongoose.model<AttendanceDocument>("Attendance", attendanceSchema);

export default Attendance;
