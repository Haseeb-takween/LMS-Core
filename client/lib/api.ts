const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const RAW_API_URL = API_URL;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthUser {
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  schedule: string;
  isActive: boolean;
  enrollmentStatus?: "pending" | "approved" | "rejected" | null;
  sessions?: Session[];
}

export interface Session {
  _id: string;
  lessonNumber: number;
  title: string;
  description?: string;
  order: number;
  locked?: boolean;
  attendanceStatus?: "attended" | "missed" | null;
  quizSubmitted?: boolean;
  quizScore?: { mcScore: number; mcTotal: number } | null;
}

export interface Enrollment {
  _id: string;
  studentId: string;
  courseId: Course | string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export interface Question {
  _id: string;
  type: "mc" | "short";
  text: string;
  options?: string[];
  correctAnswer?: string;
  order: number;
}

export interface SubmittedAnswer {
  questionId: string;
  type: "mc" | "short";
  answer: string;
  isCorrect?: boolean;
}

export interface SessionDetail extends Session {
  quiz: { _id: string; questions: Question[] } | null;
  submission: {
    answers: SubmittedAnswer[];
    mcScore: number;
    mcTotal: number;
    submittedAt: string;
  } | null;
}

export interface CertificateData {
  _id?: string;
  status: "not_eligible" | "pending_approval" | "approved" | "rejected";
  attendancePercent: number;
  quizAverage: number;
  rejectionReason?: string;
  approvedAt?: string;
  attendanceThreshold?: number;
  quizThreshold?: number;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    return { success: false, message: "Network error" };
  }
  try {
    return await res.json() as ApiResponse<T>;
  } catch {
    return { success: false, message: res.status >= 500 ? "Server error" : "Invalid response" };
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
