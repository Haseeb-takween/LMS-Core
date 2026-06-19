import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser, type Enrollment, type Course } from "@/lib/api";
import Navbar from "../_components/Navbar";

export default async function DashboardPage() {
  const api = await getServerApi();
  const userRes = await api.get<AuthUser>("/auth/me");
  if (!userRes.success || !userRes.data) redirect("/login");
  const user = userRes.data;

  const enrollRes = await api.get<Enrollment[]>("/enrollments/my");
  const enrollments: Enrollment[] = enrollRes.data ?? [];

  const total = enrollments.length;
  const pending = enrollments.filter((e) => e.status === "pending").length;
  const approved = enrollments.filter((e) => e.status === "approved").length;

  const statusColor = (s: string) =>
    s === "approved" ? "#1d4ed8" : s === "pending" ? "#d97706" : "#dc2626";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto">

        {/* Hero greeting */}
        <div className="mb-10 pb-8 border-b border-[#1e1e2e] flex items-end justify-between">
          <div>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-1 tracking-widest uppercase">
              Welcome back
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold text-[#e8e8f0]">
              {user.name}
            </h1>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] mt-1">
              {user.email}
            </p>
          </div>
          <span
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-2 py-1 hidden sm:inline"
            style={{
              color: "#4f8ef7",
              background: "rgba(79,142,247,0.08)",
              border: "1px solid rgba(79,142,247,0.2)",
            }}
          >
            Student
          </span>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 mb-10 border border-[#1e1e2e]">
          {[
            { label: "Enrolled", value: total },
            { label: "Pending", value: pending },
            { label: "Approved", value: approved },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-5 flex flex-col gap-1"
              style={{
                borderRight: i < 2 ? "1px solid #1e1e2e" : undefined,
              }}
            >
              <span className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#e8e8f0]">
                {stat.value}
              </span>
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Enrolled courses */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
              My Courses
            </h2>
            <Link
              href="/courses"
              className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#4f8ef7] hover:opacity-80 transition-opacity"
            >
              Browse more →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="border border-[#1e1e2e] px-6 py-10 text-center">
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] mb-4">
                No enrollments yet.
              </p>
              <Link
                href="/courses"
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#4f8ef7] hover:opacity-80 transition-opacity"
              >
                Browse courses →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enr) => {
                const course = enr.courseId as Course;
                const sc = statusColor(enr.status);
                return (
                  <div
                    key={enr._id}
                    className="bg-[#12121a] border border-[#1e1e2e] p-6 flex flex-col gap-4 hover:border-[#2a2a3e] transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-1 h-1 bg-[#4f8ef7]" />
                      <span
                        className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] tracking-widest uppercase px-1.5 py-0.5"
                        style={{
                          color: sc,
                          background: `${sc}14`,
                          border: `1px solid ${sc}33`,
                        }}
                      >
                        {enr.status}
                      </span>
                    </div>

                    <h3 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#e8e8f0] leading-snug">
                      {typeof course === "object" ? course.title : "—"}
                    </h3>

                    {typeof course === "object" && (
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
                        {course.schedule}
                      </p>
                    )}

                    <div className="mt-auto pt-2 border-t border-[#1e1e2e]">
                      {enr.status === "approved" ? (
                        <Link
                          href={`/my-courses/${enr._id}`}
                          className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#4f8ef7] hover:opacity-80 transition-opacity"
                        >
                          View course →
                        </Link>
                      ) : (
                        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
                          {enr.status === "pending" ? "Awaiting approval" : "Enrollment rejected"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
