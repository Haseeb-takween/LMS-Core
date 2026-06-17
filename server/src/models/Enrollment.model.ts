import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface IEnrollment {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: EnrollmentStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
}

export type EnrollmentDocument = IEnrollment & Document;

const enrollmentSchema = new Schema<EnrollmentDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    requestedAt: { type: Date, default: () => new Date() },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
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

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment: Model<EnrollmentDocument> =
  mongoose.model<EnrollmentDocument>("Enrollment", enrollmentSchema);

export default Enrollment;
