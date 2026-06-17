import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IQuestion {
  _id: Types.ObjectId;
  type: "mc" | "short";
  text: string;
  options?: string[];
  correctAnswer?: string;
  order: number;
}

export interface IQuiz {
  sessionId: Types.ObjectId;
  questions: IQuestion[];
}

export type QuizDocument = IQuiz & Document;

const questionSubdocSchema = new Schema<IQuestion>(
  {
    type: { type: String, enum: ["mc", "short"], required: true },
    text: { type: String, required: true, trim: true },
    options: { type: [String], default: undefined },
    correctAnswer: { type: String, default: undefined },
    order: { type: Number, required: true },
  },
  { _id: true }
);

const quizSchema = new Schema<QuizDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      unique: true,
    },
    questions: { type: [questionSubdocSchema], default: [] },
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

const Quiz: Model<QuizDocument> = mongoose.model<QuizDocument>(
  "Quiz",
  quizSchema
);

export default Quiz;
