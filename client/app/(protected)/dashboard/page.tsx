import { redirect } from "next/navigation";
import { AuthUser } from "@/lib/api";
import { getServerApi } from "@/lib/api-server";
import LogoutButton from "./logout-button";

const PLACEHOLDER_COURSES = [
  { id: 1, title: "Introduction to Programming", category: "Computer Science" },
  { id: 2, title: "Mathematics for Engineers", category: "Mathematics" },
  { id: 3, title: "Academic Writing", category: "Humanities" },
];

export default async function DashboardPage() {
  const api = await getServerApi();
  const res = await api.get<AuthUser>("/auth/me");
  if (!res.success || !res.data) {
    redirect("/login");
  }
  const user = res.data;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* ── Top nav ── */}
      <header className="bg-[#12121a] border-b border-[#1e1e2e] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-syne)] text-sm font-bold text-[#e8e8f0]">
            LMS Core
          </span>
          <span className="w-px h-4 bg-[#1e1e2e]" />
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80]">
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] hidden sm:block">
            {user.name}
          </span>
          <LogoutButton />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto">

        {/* Greeting */}
        <div className="mb-12 pb-8 border-b border-[#1e1e2e]">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] mb-1 tracking-wider">
            Welcome back
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[#e8e8f0]">
            {user.name}
          </h1>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] mt-1">
            {user.email}
          </p>
        </div>

        {/* Courses section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
              My Courses
            </h2>
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
              {PLACEHOLDER_COURSES.length} enrolled
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLACEHOLDER_COURSES.map((course) => (
              <div
                key={course.id}
                className="bg-[#12121a] border border-[#1e1e2e] p-6 flex flex-col gap-5 hover:border-[#2a2a3e] transition-colors duration-200"
              >
                {/* Category */}
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#4f8ef7]" />
                  <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                    {course.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-[family-name:var(--font-syne)] text-sm font-semibold text-[#e8e8f0] leading-snug">
                  {course.title}
                </h3>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
                      Progress
                    </span>
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
                      0%
                    </span>
                  </div>
                  <div className="h-px bg-[#1e1e2e] w-full">
                    <div className="h-px bg-[#4f8ef7] w-0" />
                  </div>
                </div>

                {/* Status badge */}
                <div className="mt-auto">
                  <span
                    className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-2 py-1"
                    style={{
                      color: "#4f8ef7",
                      background: "rgba(79,142,247,0.08)",
                      border: "1px solid rgba(79,142,247,0.2)",
                    }}
                  >
                    Coming soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
