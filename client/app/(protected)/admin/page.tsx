import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser } from "@/lib/api";
import AdminShell from "./_components/AdminShell";

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  latestJoin: string | null;
  totalCourses: number;
  pendingEnrollments: number;
  pendingCertificates: number;
}

interface Course {
  _id: string;
  title: string;
  schedule: string;
}

export default async function AdminPage() {
  const api = await getServerApi();
  const [userRes, statsRes, coursesRes] = await Promise.all([
    api.get<AuthUser>("/auth/me"),
    api.get<AdminStats>("/admin/stats"),
    api.get<Course[]>("/courses"),
  ]);

  if (!userRes.success || !userRes.data) redirect("/login");
  if (!statsRes.success) redirect("/login");

  const user = userRes.data;
  const stats = statsRes.data!;
  const courses: Course[] = coursesRes.data ?? [];

  const statCards = [
    { label: "Total Students", value: stats.totalUsers, href: null },
    {
      label: "Pending Enrollments",
      value: stats.pendingEnrollments,
      href: "/admin/enrollments",
      accent: stats.pendingEnrollments > 0 ? "#d97706" : undefined,
    },
    { label: "Total Courses", value: stats.totalCourses, href: null },
    {
      label: "Pending Certificates",
      value: stats.pendingCertificates,
      href: "/admin/certificates",
      accent: stats.pendingCertificates > 0 ? "#d97706" : undefined,
    },
  ];

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-[#1e1e2e]">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-1 tracking-widest uppercase">
            Overview
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[#e8e8f0]">
            Admin Dashboard
          </h1>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-[#12121a] border border-[#1e1e2e] p-5 flex flex-col gap-2 hover:border-[#2a2a3e] transition-colors"
            >
              <span
                className="font-[family-name:var(--font-syne)] text-3xl font-bold"
                style={{ color: card.accent ?? "#e8e8f0" }}
              >
                {card.value}
              </span>
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                {card.label}
              </span>
              {card.href && (
                <Link
                  href={card.href}
                  className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#4f8ef7] hover:opacity-80 transition-opacity mt-auto"
                >
                  View →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-10">
          <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#e8e8f0] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Manage Enrollments", href: "/admin/enrollments" },
              { label: "View Attendance",    href: "/admin/attendance"   },
              { label: "Quiz Results",       href: "/admin/quiz-results" },
              { label: "Certificates",       href: "/admin/certificates" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="border border-[#1e1e2e] px-4 py-3 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.15em] uppercase text-[#6b6b80] hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors duration-150"
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Course rosters */}
        {courses.length > 0 && (
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#e8e8f0] mb-4">
              Course Rosters
            </h2>
            <div className="border border-[#1e1e2e]">
              {courses.map((course, i) => (
                <div
                  key={course._id}
                  className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] last:border-0 hover:bg-[#12121a] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0]">
                        {course.title}
                      </p>
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80]">
                        {course.schedule}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/courses/${course._id}/roster`}
                    className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#4f8ef7] hover:opacity-80 transition-opacity"
                  >
                    Roster →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
