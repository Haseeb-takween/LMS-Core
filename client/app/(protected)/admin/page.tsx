import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser } from "@/lib/api";
import AdminShell from "./_components/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, BookOpen, Award, ClipboardList, CalendarCheck, FileQuestion, ArrowRight } from "lucide-react";

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
    { label: "Total Students", value: stats.totalUsers, icon: Users, gradient: "from-blue-500/10 via-blue-500/5 to-transparent", accent: false, href: null as string | null },
    { label: "Pending Enrollments", value: stats.pendingEnrollments, href: "/admin/enrollments", icon: Clock, gradient: "from-amber-500/10 via-amber-500/5 to-transparent", accent: stats.pendingEnrollments > 0 },
    { label: "Total Courses", value: stats.totalCourses, icon: BookOpen, gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent", accent: false, href: null as string | null },
    { label: "Pending Certificates", value: stats.pendingCertificates, href: "/admin/certificates", icon: Award, gradient: "from-purple-500/10 via-purple-500/5 to-transparent", accent: stats.pendingCertificates > 0 },
  ];

  const quickActions = [
    { label: "Manage Enrollments", href: "/admin/enrollments", icon: ClipboardList },
    { label: "View Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { label: "Quiz Results", href: "/admin/quiz-results", icon: FileQuestion },
    { label: "Certificates", href: "/admin/certificates", icon: Award },
  ];

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-10 animate-fade-in-up">
          <p className="text-xs text-muted-foreground mb-2 tracking-widest uppercase font-semibold">
            Overview
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-4xl font-extrabold text-foreground tracking-tight">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {statCards.map((card, i) => {
            const inner = (
              <Card
                className={`bg-gradient-to-br ${card.gradient} shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 card-glow animate-fade-in-up stagger-${i + 1} ${card.accent ? "animate-border-glow" : ""} ${card.href ? "cursor-pointer" : ""} h-full`}
              >
                <CardContent className="flex flex-col gap-3 py-6">
                  <card.icon className="w-6 h-6 text-muted-foreground/30" />
                  <span
                    className="font-[family-name:var(--font-syne)] text-4xl font-extrabold animate-count-up tracking-tight"
                    style={{ color: card.accent ? "#d97706" : undefined }}
                  >
                    {card.value}
                  </span>
                  <span className="text-sm tracking-wide uppercase text-muted-foreground font-semibold">
                    {card.label}
                  </span>
                </CardContent>
              </Card>
            );
            return card.href ? (
              <Link key={card.label} href={card.href} className="block">{inner}</Link>
            ) : (
              <div key={card.label}>{inner}</div>
            );
          })}
        </div>

        <div className="mb-12 animate-fade-in-up stagger-5">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground mb-5 tracking-tight">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <Link key={a.href} href={a.href} className="block">
                <Card className={`shadow-md shadow-black/10 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer group card-glow h-full animate-fade-in-up stagger-${i + 1}`}>
                  <CardContent className="flex items-center gap-3 py-5">
                    <a.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm tracking-wide uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-200 font-bold">
                      {a.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {courses.length > 0 && (
          <div className="animate-fade-in-up stagger-6">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground mb-5 tracking-tight">
              Course Rosters
            </h2>
            <Card className="shadow-lg shadow-black/20 overflow-hidden">
              {courses.map((course, i) => (
                <Link
                  key={course._id}
                  href={`/admin/courses/${course._id}/roster`}
                  className="flex items-center justify-between px-5 py-5 border-b border-border last:border-0 row-highlight group/row cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-6 group-hover/row:text-primary transition-colors duration-200 font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-base text-foreground font-bold group-hover/row:text-primary transition-colors duration-200">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {course.schedule}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover/row:text-primary group-hover/row:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </Card>
          </div>
        )}
      </main>

      <footer className="px-8 py-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
