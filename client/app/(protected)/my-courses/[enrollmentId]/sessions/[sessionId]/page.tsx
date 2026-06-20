"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type SessionDetail } from "@/lib/api";
import Navbar from "../../../../_components/Navbar";
import QuizForm from "./QuizForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetailPage() {
  const { user } = useAuth();
  const { enrollmentId, sessionId } = useParams<{ enrollmentId: string; sessionId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);

  useEffect(() => {
    api.get<SessionDetail>(`/enrollments/${enrollmentId}/sessions/${sessionId}`).then((res) => {
      if (res.success && res.data) {
        setSession(res.data);
      } else {
        router.replace(`/my-courses/${enrollmentId}`);
      }
    });
  }, [enrollmentId, sessionId, router]);

  if (!user) return null;

  if (!session) return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-8 py-10">
        <Skeleton className="h-3 w-32 mb-8 bg-white/5" />
        <Skeleton className="h-3 w-24 mb-3 bg-white/5" />
        <Skeleton className="h-8 w-3/4 mb-2 bg-white/5" />
        <Skeleton className="h-16 w-full mb-8 bg-white/5" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 bg-white/5" />)}
        </div>
      </main>
    </div>
  );

  const submitted = !!session.submission;
  const questions = session.quiz?.questions ?? [];

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-8 py-10">
        <div className="mb-8 flex items-center gap-2 flex-wrap">
          <Link
            href={`/my-courses/${enrollmentId}`}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80] hover:text-[#e8e8f0] transition-colors"
          >
            ← Course
          </Link>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#1e1e2e]">/</span>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
            Lesson {session.lessonNumber}
          </span>
        </div>

        <div className="mb-8 pb-6 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] tracking-widest uppercase">
              Lesson {String(session.lessonNumber).padStart(2, "0")}
            </span>
            {session.attendanceStatus && (
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] tracking-widest uppercase px-1.5 py-0.5"
                style={{
                  color: session.attendanceStatus === "attended" ? "#1d4ed8" : "#dc2626",
                  background: session.attendanceStatus === "attended" ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
                  border: `1px solid ${session.attendanceStatus === "attended" ? "rgba(29,78,216,0.25)" : "rgba(220,38,38,0.25)"}`,
                }}
              >
                {session.attendanceStatus}
              </span>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#e8e8f0] mb-3">
            {session.title}
          </h1>
          {session.description && (
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] leading-6">
              {session.description}
            </p>
          )}
        </div>

        {questions.length === 0 ? (
          <div className="border border-[#1e1e2e] px-5 py-6 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
            No quiz for this session.
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
                Quiz
              </h2>
              {submitted && session.submission && (
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase px-2 py-1"
                  style={{ color: "#1d4ed8", background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.25)" }}
                >
                  {session.submission.mcTotal > 0
                    ? `Score: ${session.submission.mcScore}/${session.submission.mcTotal}`
                    : "Submitted"}
                </span>
              )}
            </div>

            {submitted && session.submission ? (
              <div className="flex flex-col gap-5">
                {questions.map((q, i) => {
                  const ans = session.submission!.answers.find((a) => a.questionId === q._id);
                  const isCorrect = ans?.isCorrect;
                  const isMc = q.type === "mc";

                  return (
                    <div key={q._id} className="border border-[#1e1e2e] p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] shrink-0 mt-0.5">
                          Q{i + 1}
                        </span>
                        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#e8e8f0] leading-5">
                          {q.text}
                        </p>
                        {isMc && (
                          <span
                            className="shrink-0 font-[family-name:var(--font-ibm-plex-mono)] text-[8px] tracking-widest uppercase px-1.5 py-0.5 ml-auto"
                            style={{
                              color: isCorrect ? "#1d4ed8" : "#dc2626",
                              background: isCorrect ? "rgba(29,78,216,0.08)" : "rgba(220,38,38,0.08)",
                              border: `1px solid ${isCorrect ? "rgba(29,78,216,0.25)" : "rgba(220,38,38,0.25)"}`,
                            }}
                          >
                            {isCorrect ? "Correct" : "Wrong"}
                          </span>
                        )}
                      </div>

                      {isMc && q.options ? (
                        <div className="flex flex-col gap-2 pl-6">
                          {q.options.map((opt, oi) => {
                            const isStudentAnswer = ans?.answer === opt;
                            const isCorrectOpt = opt === q.correctAnswer;
                            let color = "#6b6b80";
                            if (isStudentAnswer && isCorrect) color = "#1d4ed8";
                            else if (isStudentAnswer && !isCorrect) color = "#dc2626";
                            else if (isCorrectOpt) color = "#1d4ed8";

                            return (
                              <div key={oi} className="flex items-center gap-3">
                                <span
                                  className="w-4 h-4 border shrink-0 flex items-center justify-center"
                                  style={{
                                    borderColor: isStudentAnswer || isCorrectOpt ? color : "#1e1e2e",
                                    background: isStudentAnswer ? `${color}14` : "transparent",
                                  }}
                                >
                                  {isStudentAnswer && (
                                    <span className="w-1.5 h-1.5" style={{ background: color }} />
                                  )}
                                </span>
                                <span
                                  className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px]"
                                  style={{ color }}
                                >
                                  {opt}
                                  {isCorrectOpt && !isStudentAnswer && (
                                    <span className="ml-2 text-[8px] tracking-widest uppercase" style={{ color: "#1d4ed8" }}>
                                      ← correct
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="pl-6">
                          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-wider uppercase text-[#6b6b80] mb-1">
                            Your answer
                          </p>
                          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0] border border-[#1e1e2e] px-3 py-2 bg-[#12121a] leading-5">
                            {ans?.answer || "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <QuizForm
                enrollmentId={enrollmentId}
                sessionId={sessionId}
                questions={questions}
              />
            )}
          </div>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
