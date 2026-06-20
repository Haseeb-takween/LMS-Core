"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Course } from "@/lib/api";
import Navbar from "../../_components/Navbar";
import EnrollButton from "../EnrollButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Calendar, Lock, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    api.get<Course>(`/courses/${id}`).then((res) => {
      if (res.success && res.data) {
        setCourse(res.data);
      } else {
        router.replace("/courses");
      }
    });
  }, [id, router]);

  if (!user) return null;

  if (!course) return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-10">
        <Skeleton className="h-3 w-32 mb-8" />
        <div className="flex gap-8 flex-col lg:flex-row">
          <div className="flex-[3] flex flex-col gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <div className="flex-[2]">
            <Skeleton className="h-64" />
          </div>
        </div>
      </main>
    </div>
  );

  const sessions = course.sessions ?? [];
  const isApproved = course.enrollmentStatus === "approved";

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-10">
        <div className="mb-8 flex items-center gap-2 animate-fade-in-up">
          <Link
            href="/courses"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 font-semibold"
          >
            Courses
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-sm text-muted-foreground truncate max-w-xs font-medium">
            {course.title}
          </span>
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          <div className="flex-[3] flex flex-col gap-6">
            <div className="animate-fade-in-up stagger-1">
              <p className="text-xs text-primary tracking-widest uppercase mb-2 font-bold">
                Course
              </p>
              <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-foreground leading-tight mb-4 tracking-tight">
                {course.title}
              </h1>
              <p className="text-base text-muted-foreground leading-7 font-medium">
                {course.description}
              </p>
            </div>

            <Card className="shadow-lg shadow-black/20 card-glow animate-fade-in-up stagger-2 hover:shadow-xl transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-300">
              <CardContent className="flex items-center gap-4 py-5">
                <Calendar className="w-5 h-5 text-primary/60" />
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1 font-semibold">
                    Schedule
                  </p>
                  <p className="text-base text-foreground font-bold">
                    {course.schedule}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg shadow-black/20 card-glow animate-fade-in-up stagger-3 hover:shadow-xl transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-300">
              <CardContent className="flex flex-col gap-4 py-5">
                <p className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">
                  Enrollment
                </p>
                <EnrollButton
                  courseId={course._id}
                  initialStatus={course.enrollmentStatus ?? null}
                />
                {course.enrollmentStatus === "approved" && (
                  <p className="text-sm text-muted-foreground font-medium">
                    You are enrolled. View sessions below.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex-[2] animate-fade-in-up stagger-4">
            <Card className="shadow-lg shadow-black/20 overflow-hidden">
              <CardHeader className="border-b border-border flex-row items-center justify-between">
                <CardTitle className="font-[family-name:var(--font-syne)] text-base font-bold tracking-tight">
                  Sessions
                </CardTitle>
                <span className="text-sm text-muted-foreground font-semibold">
                  {sessions.length} lesson{sessions.length !== 1 ? "s" : ""}
                </span>
              </CardHeader>

              <CardContent className="p-0">
                {sessions.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-muted-foreground font-medium text-center">
                    No sessions yet.
                  </div>
                ) : (
                  sessions.map((s, i) => (
                    <div
                      key={s._id}
                      className={`flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 row-highlight group/session animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                      style={{ opacity: s.locked ? 0.5 : 1 }}
                    >
                      <span className="text-xs text-muted-foreground w-6 shrink-0 group-hover/session:text-primary transition-colors duration-200 font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate font-semibold">
                          {s.title}
                        </p>
                      </div>
                      {s.locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-primary fill-primary shrink-0 animate-dot-pulse" />
                      )}
                    </div>
                  ))
                )}

                {!isApproved && sessions.length > 0 && (
                  <div className="px-5 py-4 bg-secondary/30 border-t border-border">
                    <p className="text-sm text-muted-foreground font-medium">
                      Enroll and get approved to unlock sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
