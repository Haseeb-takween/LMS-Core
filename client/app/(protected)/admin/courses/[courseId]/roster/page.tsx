"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import AdminShell from "../../../_components/AdminShell";
import RosterGrid from "./RosterGrid";

interface RosterData {
  course: { _id: string; title: string; schedule: string };
  sessions: { _id: string; lessonNumber: number; title: string; order: number }[];
  students: {
    student: { _id: string; name: string; email: string };
    enrollmentId: string;
    attendance: Record<string, string | null>;
    attendancePercent: number;
  }[];
}

export default function RosterPage() {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const [roster, setRoster] = useState<RosterData | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    api.get<RosterData>(`/admin/courses/${courseId}/roster`).then((res) => {
      if (res.success && res.data) {
        setRoster(res.data);
      } else {
        router.replace("/admin");
      }
    });
  }, [courseId, router]);

  if (!user || user.role !== "admin" || !roster) return null;

  const { course, sessions, students } = roster;

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-8 py-10 max-w-6xl w-full mx-auto">
        <div className="mb-8 pb-6 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/admin"
              className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80] hover:text-[#e8e8f0] transition-colors"
            >
              ← Admin
            </Link>
          </div>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-1 tracking-widest uppercase">
            {course.schedule}
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[#e8e8f0]">
            {course.title}
          </h1>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mt-1">
            {students.length} enrolled · {sessions.length} sessions
          </p>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80] tracking-widest uppercase">
            Legend:
          </p>
          <div className="flex items-center gap-1.5">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] font-semibold" style={{ color: "#1d4ed8" }}>AT</span>
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80]">= Attended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] font-semibold" style={{ color: "#dc2626" }}>MI</span>
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80]">= Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] text-[#2a2a3e]">—</span>
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80]">= Not recorded</span>
          </div>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80]">· Click cell to toggle</span>
        </div>

        <RosterGrid
          courseId={courseId}
          sessions={sessions}
          initialStudents={students}
        />
      </main>

      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
