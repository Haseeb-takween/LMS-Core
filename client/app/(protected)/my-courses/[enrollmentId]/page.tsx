"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Enrollment, type Course, type Session } from "@/lib/api";
import Navbar from "../../_components/Navbar";
import AnimatedBar from "../../_components/AnimatedBar";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Award, BarChart3, CalendarCheck } from "lucide-react";

interface SessionRow extends Session {
  quizScore?: { mcScore: number; mcTotal: number } | null;
}

interface PageData {
  enrollment: Enrollment;
  sessions: SessionRow[];
  attendancePercent: number;
}

export default function MyCourseDetailPage() {
  const { user } = useAuth();
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Enrollment[]>("/enrollments/my"),
      api.get<SessionRow[]>(`/enrollments/${enrollmentId}/sessions`),
      api.get<{ attendancePercent: number }>(`/enrollments/${enrollmentId}/attendance`),
    ]).then(([enrollmentsRes, sessionsRes, attendanceRes]) => {
      const enrollment = (enrollmentsRes.data ?? []).find((e) => e._id === enrollmentId);
      if (!enrollment || enrollment.status !== "approved") {
        router.replace("/dashboard");
        return;
      }
      setData({
        enrollment,
        sessions: sessionsRes.data ?? [],
        attendancePercent: attendanceRes.data?.attendancePercent ?? 0,
      });
    });
  }, [enrollmentId, router]);

  if (!user || !data) return null;

  const { enrollment, sessions, attendancePercent } = data;
  const course = enrollment.courseId as Course;

  const quizScores = sessions
    .filter((s) => s.quizScore && s.quizScore.mcTotal > 0)
    .map((s) => Math.round((s.quizScore!.mcScore / s.quizScore!.mcTotal) * 100));
  const quizAvg =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

  const statusLabel = (s: SessionRow) => {
    if (s.attendanceStatus === "attended") return { text: "ATTENDED", color: "#1d4ed8" };
    if (s.attendanceStatus === "missed") return { text: "MISSED", color: "#dc2626" };
    return { text: "—", color: "#6b6b80" };
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-8 py-10">
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 mb-4 inline-flex items-center gap-1.5 font-semibold group/back"
          >
            <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-0.5 transition-transform duration-200" /> Dashboard
          </Link>
          <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-foreground mb-1 tracking-tight">
            {typeof course === "object" ? course.title : "Course"}
          </h1>
          {typeof course === "object" && (
            <p className="text-base text-muted-foreground font-medium">
              {course.schedule}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Card className="shadow-lg shadow-black/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent card-glow animate-fade-in-up stagger-1 hover:shadow-xl transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-300 hover:-translate-y-0.5">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm tracking-wide uppercase text-muted-foreground flex items-center gap-2 font-semibold">
                  <CalendarCheck className="w-4 h-4" /> Attendance
                </span>
                <span className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground animate-count-up tracking-tight">
                  {attendancePercent}%
                </span>
              </div>
              <AnimatedBar percent={attendancePercent} color="#1d4ed8" height="5px" />
            </CardContent>
          </Card>

          <Card className="shadow-lg shadow-black/20 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent card-glow animate-fade-in-up stagger-2 hover:shadow-xl transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-300 hover:-translate-y-0.5">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm tracking-wide uppercase text-muted-foreground flex items-center gap-2 font-semibold">
                  <BarChart3 className="w-4 h-4" /> Quiz Avg
                </span>
                <span className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground animate-count-up tracking-tight">
                  {quizAvg !== null ? `${quizAvg}%` : "—"}
                </span>
              </div>
              <AnimatedBar percent={quizAvg ?? 0} color="#4f8ef7" height="5px" />
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground tracking-tight">
              Sessions
            </h2>
            <Link
              href={`/my-courses/${enrollmentId}/certificate`}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 font-semibold group/cert"
            >
              <Award className="w-4 h-4" /> Certificate <ArrowRight className="w-4 h-4 group-hover/cert:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <Card className="shadow-lg shadow-black/20 overflow-hidden">
            <CardContent className="p-0">
              <div
                className="grid text-xs tracking-widest uppercase text-muted-foreground px-5 py-3 border-b border-border bg-secondary/30 font-bold"
                style={{ gridTemplateColumns: "2.5rem 1fr 7rem 6rem 3rem" }}
              >
                <span>#</span>
                <span>Lesson</span>
                <span>Attendance</span>
                <span>Quiz</span>
                <span />
              </div>

              {sessions.length === 0 ? (
                <div className="px-5 py-8 text-sm text-muted-foreground font-medium text-center">
                  No sessions yet.
                </div>
              ) : (
                sessions.map((s, i) => {
                  const att = statusLabel(s);
                  const quizScore = s.quizScore;
                  const quizPct =
                    quizScore && quizScore.mcTotal > 0
                      ? Math.round((quizScore.mcScore / quizScore.mcTotal) * 100)
                      : null;

                  return (
                    <Link
                      key={s._id}
                      href={`/my-courses/${enrollmentId}/sessions/${s._id}`}
                      className={`grid items-center px-5 py-4 border-b border-border last:border-0 row-highlight group/row cursor-pointer animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                      style={{ gridTemplateColumns: "2.5rem 1fr 7rem 6rem 3rem" }}
                    >
                      <span className="text-sm text-muted-foreground group-hover/row:text-primary transition-colors duration-200 font-bold">
                        {String(s.lessonNumber).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-foreground truncate pr-4 font-semibold group-hover/row:text-primary transition-colors duration-200">
                        {s.title}
                      </span>
                      <span
                        className="text-xs tracking-widest uppercase font-bold"
                        style={{ color: att.color }}
                      >
                        {att.text}
                      </span>
                      <span className="text-sm font-bold" style={{ color: quizPct !== null ? undefined : "#6b6b80" }}>
                        {quizPct !== null ? `${quizPct}%` : "—"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover/row:text-primary group-hover/row:translate-x-0.5 transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200 ml-auto" />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="px-8 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
