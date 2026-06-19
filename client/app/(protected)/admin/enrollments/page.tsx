"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import EnrollmentTable from "./EnrollmentTable";

interface Enrollment {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  courseId: { _id: string; title: string; schedule: string };
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export default function EnrollmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    api.get<Enrollment[]>("/admin/enrollments").then((res) => {
      if (res.success && res.data) setEnrollments(res.data);
    });
  }, []);

  if (!user || user.role !== "admin") return null;

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <p className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest uppercase">
            Admin / Enrollments
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground tracking-tight">
            Enrollment Requests
          </h1>
        </div>

        <EnrollmentTable initialEnrollments={enrollments} initialFilter="all" />
      </main>

      <footer className="px-8 py-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
