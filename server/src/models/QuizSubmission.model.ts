import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAnswer {
  questionId: Types.ObjectId;
  type: "mc" | "short";
  answer: string;
  isCorrect?: boolean;
}

export interface IQuizSubmission {
  enrollmentId: Types.ObjectId;
  sessionId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: IAnswer[];
  mcScore: number;
  mcTotal: number;
  submittedAt: Date;
}

export type QuizSubmissionDocument = IQuizSubmission & Document;

const answerSubdocSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ["mc", "short"], required: true },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean },
  },
  { _id: false }
);

const quizSubmissionSchema = new Schema<QuizSubmissionDocument>(
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
    answers: { type: [answerSubdocSchema], default: [] },
    mcScore: { type: Number, required: true, default: 0 },
    mcTotal: { type: Number, required: true, default: 0 },
    submittedAt: { type: Date, default: () => new Date() },
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

quizSubmissionSchema.index({ enrollmentId: 1, sessionId: 1 }, { unique: true });

const QuizSubmission: Model<QuizSubmissionDocument> =
  mongoose.model<QuizSubmissionDocument>("QuizSubmission", quizSubmissionSchema);

export default QuizSubmission;
