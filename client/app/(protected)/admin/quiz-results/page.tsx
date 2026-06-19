"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileQuestion } from "lucide-react";

interface Course {
  _id: string;
  title: string;
}

interface EnrichedAnswer {
  questionId: string;
  questionText: string;
  type: "mc" | "short";
  answer: string;
  isCorrect?: boolean;
  correctAnswer?: string;
}

interface QuizResult {
  _id: string;
  student: { _id: string; name: string; email: string };
  course: { _id: string; title: string };
  session: { _id: string; lessonNumber: number; title: string };
  mcScore: number;
  mcTotal: number;
  submittedAt: string;
  answers: EnrichedAnswer[];
}

export default function QuizResultsPage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<{ name: string; email: string }>("/auth/me"),
      api.get<Course[]>("/courses"),
    ]).then(([userRes, coursesRes]) => {
      if (userRes.success && userRes.data) setUser(userRes.data);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
    });
  }, []);

  async function fetchResults(courseId: string) {
    setSelectedCourse(courseId);
    setExpanded(null);
    if (!courseId) { setResults([]); return; }
    setLoading(true);
    const res = await api.get<QuizResult[]>(`/admin/quiz-results?courseId=${courseId}`);
    if (res.success && res.data) setResults(res.data);
    setLoading(false);
  }

  const selectedCourseName = courses.find((c) => c._id === selectedCourse)?.title ?? "";

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-8">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground mb-1 tracking-widest uppercase">
            Admin / Quiz Results
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
            Quiz Results
          </h1>
        </div>

        {/* Course selector */}
        <div className="mb-8">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground mb-2">
            Select Course
          </p>
          <select
            value={selectedCourse}
            onChange={(e) => fetchResults(e.target.value)}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] bg-card border border-border text-foreground px-4 py-3 outline-none focus:border-primary/40 transition-colors appearance-none cursor-pointer w-full max-w-sm rounded-lg shadow-sm"
          >
            <option value="">— Choose a course —</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {!selectedCourse && (
          <Card className="shadow-lg shadow-black/20">
            <CardContent className="py-10 text-center">
              <FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">
                Select a course to view quiz submissions.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedCourse && loading && (
          <Card className="shadow-lg shadow-black/20">
            <CardContent className="py-10 text-center">
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        )}

        {selectedCourse && !loading && results.length === 0 && (
          <Card className="shadow-lg shadow-black/20">
            <CardContent className="py-10 text-center">
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">
                No quiz submissions for this course.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedCourse && !loading && results.length > 0 && (
          <div>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground mb-4">
              {results.length} submission{results.length !== 1 ? "s" : ""} — {selectedCourseName}
            </p>
            <Card className="shadow-lg shadow-black/20 overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div
                  className="grid bg-secondary/30 border-b border-border px-5 py-3"
                  style={{ gridTemplateColumns: "1fr 1fr 8rem 6rem 3rem" }}
                >
                  {["Student", "Session", "Submitted", "MC Score", ""].map((h) => (
                    <span key={h} className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                      {h}
                    </span>
                  ))}
                </div>

                {results.map((r) => {
                  const isOpen = expanded === r._id;
                  const student = r.student as { name: string; email: string };
                  const session = r.session as { lessonNumber: number; title: string };
                  const mcPct = r.mcTotal > 0 ? Math.round((r.mcScore / r.mcTotal) * 100) : null;

                  return (
                    <div key={r._id} className="border-b border-border last:border-0">
                      <div
                        className="grid items-center px-5 py-4 hover:bg-secondary/20 transition-colors cursor-pointer"
                        style={{ gridTemplateColumns: "1fr 1fr 8rem 6rem 3rem" }}
                        onClick={() => setExpanded(isOpen ? null : r._id)}
                      >
                        <div className="pr-3 min-w-0">
                          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate">{student.name}</p>
                          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-muted-foreground truncate">{student.email}</p>
                        </div>
                        <div className="pr-3 min-w-0">
                          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate">
                            L{session.lessonNumber} — {session.title}
                          </p>
                        </div>
                        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">
                          {new Date(r.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </p>
                        <div>
                          {mcPct !== null ? (
                            <span
                              className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold"
                              style={{ color: mcPct >= 70 ? "#1d4ed8" : "#dc2626" }}
                            >
                              {r.mcScore}/{r.mcTotal} ({mcPct}%)
                            </span>
                          ) : (
                            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">—</span>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
                        />
                      </div>

                      {isOpen && (
                        <div className="px-5 pb-5 bg-background/50 border-t border-border">
                          <div className="flex flex-col gap-3 pt-4">
                            {r.answers.map((a, i) => {
                              const isMc = a.type === "mc";
                              const correct = a.isCorrect;
                              return (
                                <Card key={a.questionId} size="sm" className="shadow-sm shadow-black/10">
                                  <CardContent>
                                    <div className="flex items-start gap-3 mb-3">
                                      <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-muted-foreground shrink-0 mt-0.5">
                                        Q{i + 1}
                                      </span>
                                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground flex-1 leading-5">
                                        {a.questionText}
                                      </p>
                                      {isMc && (
                                        <Badge variant={correct ? "default" : "destructive"} className="text-[8px] tracking-widest uppercase shrink-0">
                                          {correct ? "Correct" : "Wrong"}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="pl-7 flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                                          Answer:
                                        </span>
                                        <span
                                          className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px]"
                                          style={{ color: isMc ? (correct ? "#1d4ed8" : "#dc2626") : undefined }}
                                        >
                                          {a.answer || "—"}
                                        </span>
                                      </div>
                                      {isMc && !correct && a.correctAnswer && (
                                        <div className="flex items-center gap-2">
                                          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                                            Correct:
                                          </span>
                                          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-primary">
                                            {a.correctAnswer}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-border">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
