"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Course } from "@/lib/api";
import Navbar from "../_components/Navbar";
import EnrollButton from "./EnrollButton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BookOpen, Calendar } from "lucide-react";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.get<Course[]>("/courses").then((res) => {
      if (res.success && res.data) setCourses(res.data);
    });
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 px-6 sm:px-8 py-10 max-w-6xl w-full mx-auto">
        <div className="mb-10 flex items-end justify-between animate-fade-in-up">
          <div>
            <p className="text-xs text-muted-foreground mb-2 tracking-widest uppercase font-semibold">
              Catalogue
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-foreground tracking-tight">
              Available Courses
            </h1>
          </div>
          <span className="text-sm tracking-wide uppercase text-muted-foreground font-semibold">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </span>
        </div>

        {courses.length === 0 ? (
          <Card className="shadow-lg shadow-black/20 animate-fade-in-scale">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4 animate-dot-pulse" />
              <p className="text-base text-muted-foreground font-semibold">
                No courses available at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course, i) => (
              <Link key={course._id} href={`/courses/${course._id}`} className="block">
                <Card
                  className={`shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1.5 group card-glow cursor-pointer h-full animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-widest uppercase text-muted-foreground font-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xs tracking-widest uppercase text-primary font-bold">
                        Course
                      </span>
                    </div>
                    <CardTitle className="font-[family-name:var(--font-syne)] text-lg font-bold leading-snug mt-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                      {course.description}
                    </p>

                    <div className="rounded-lg bg-secondary/50 p-3 group-hover:bg-secondary/70 transition-colors duration-300">
                      <p className="text-xs text-muted-foreground mb-1 tracking-wider uppercase flex items-center gap-1.5 font-semibold">
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule
                      </p>
                      <p className="text-sm text-foreground font-bold">
                        {course.schedule}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <div onClick={(e) => e.stopPropagation()}>
                      <EnrollButton
                        courseId={course._id}
                        initialStatus={course.enrollmentStatus ?? null}
                      />
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="px-8 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
