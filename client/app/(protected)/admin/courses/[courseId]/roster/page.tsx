import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser } from "@/lib/api";
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

export default async function RosterPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const api = await getServerApi();

  const [userRes, rosterRes] = await Promise.all([
    api.get<AuthUser>("/auth/me"),
    api.get<RosterData>(`/admin/courses/${courseId}/roster`),
  ]);

  if (!userRes.success || !userRes.data) redirect("/login");
  if (!rosterRes.success || !rosterRes.data) notFound();

  const user = userRes.data;
  const { course, sessions, students } = rosterRes.data;

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

        {/* Legend */}
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
