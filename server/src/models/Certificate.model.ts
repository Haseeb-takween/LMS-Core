import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type CertificateStatus = "pending_approval" | "approved" | "rejected";

export interface ICertificate {
  enrollmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  attendancePercent: number;
  quizAverage: number;
  status: CertificateStatus;
  rejectionReason?: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
}

export type CertificateDocument = ICertificate & Document;

const certificateSchema = new Schema<CertificateDocument>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
      unique: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    attendancePercent: { type: Number, required: true },
    quizAverage: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected"],
      default: "pending_approval",
    },
    rejectionReason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Certificate: Model<CertificateDocument> =
  mongoose.model<CertificateDocument>("Certificate", certificateSchema);

export default Certificate;
