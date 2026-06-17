import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourse {
  title: string;
  description: string;
  schedule: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseDocument = ICourse & Document;

const courseSchema = new Schema<CourseDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    schedule: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
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

const Course: Model<CourseDocument> = mongoose.model<CourseDocument>(
  "Course",
  courseSchema
);

export default Course;
