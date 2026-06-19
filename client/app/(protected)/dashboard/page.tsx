"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Enrollment, type Course } from "@/lib/api";
import Navbar from "../_components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

const statusVariant = (s: string) =>
  s === "approved" ? "default" : s === "pending" ? "secondary" : "destructive";

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    api.get<Enrollment[]>("/enrollments/my").then((res) => {
      if (res.success && res.data) setEnrollments(res.data);
    });
  }, []);

  if (!user) return null;

  const total = enrollments.length;
  const pending = enrollments.filter((e) => e.status === "pending").length;
  const approved = enrollments.filter((e) => e.status === "approved").length;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-10 animate-fade-in-up">
          <p className="text-xs text-muted-foreground mb-2 tracking-widest uppercase font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary animate-dot-pulse" aria-hidden="true" />
            Welcome back
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-5xl font-extrabold text-foreground tracking-tight leading-none">
            {user.name}
          </h1>
          <p className="text-base text-muted-foreground mt-2 font-medium">
            {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: "Enrolled", value: total, icon: BookOpen, gradient: "from-blue-500/10 via-blue-500/5 to-transparent" },
            { label: "Pending", value: pending, icon: Clock, gradient: "from-amber-500/10 via-amber-500/5 to-transparent" },
            { label: "Approved", value: approved, icon: CheckCircle2, gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent" },
          ].map((stat, i) => (
            <Card key={stat.label} className={`bg-gradient-to-br ${stat.gradient} shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 card-glow animate-fade-in-up stagger-${i + 1}`}>
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <span className="font-[family-name:var(--font-syne)] text-5xl font-extrabold text-foreground animate-count-up tracking-tight">
                    {stat.value}
                  </span>
                  <p className="text-sm tracking-wide uppercase text-muted-foreground mt-1 font-semibold">
                    {stat.label}
                  </p>
                </div>
                <stat.icon className="w-10 h-10 text-muted-foreground/15" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground tracking-tight">
              My Courses
            </h2>
            <Link
              href="/courses"
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 font-semibold group/link"
            >
              Browse more <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <Link href="/courses" className="block">
              <Card className="shadow-lg shadow-black/20 animate-fade-in-scale hover:shadow-xl hover:border-primary/30 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer">
                <CardContent className="py-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-dot-pulse" />
                  <p className="text-base text-muted-foreground mb-2 font-semibold">
                    No enrollments yet
                  </p>
                  <p className="text-sm text-primary font-semibold flex items-center justify-center gap-1">
                    Browse courses <ArrowRight className="w-4 h-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enr, i) => {
                const course = enr.courseId as Course;
                const href = enr.status === "approved" ? `/my-courses/${enr._id}` : `/courses`;
                return (
                  <Link key={enr._id} href={href} className="block">
                    <Card
                      className={`shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 group card-glow cursor-pointer h-full animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="w-2 h-2 rounded-full bg-primary animate-dot-pulse" />
                          <Badge variant={statusVariant(enr.status)} className="text-[9px] tracking-widest uppercase badge-pop font-bold px-2.5 py-1">
                            {enr.status}
                          </Badge>
                        </div>
                        <CardTitle className="font-[family-name:var(--font-syne)] text-lg font-bold leading-snug mt-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                          {typeof course === "object" ? course.title : "—"}
                        </CardTitle>
                      </CardHeader>

                      {typeof course === "object" && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                            <Clock className="w-4 h-4 shrink-0" />
                            {course.schedule}
                          </p>
                        </CardContent>
                      )}

                      <CardFooter>
                        {enr.status === "approved" ? (
                          <span className="text-sm text-primary font-semibold flex items-center gap-1.5">
                            View course <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground font-medium">
                            {enr.status === "pending" ? "Awaiting approval" : "Enrollment rejected"}
                          </span>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
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
