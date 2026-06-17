import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISession {
  courseId: Types.ObjectId;
  lessonNumber: number;
  title: string;
  description: string;
  order: number;
}

export type SessionDocument = ISession & Document;

const sessionSchema = new Schema<SessionDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lessonNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
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

const Session: Model<SessionDocument> = mongoose.model<SessionDocument>(
  "Session",
  sessionSchema
);

export default Session;
