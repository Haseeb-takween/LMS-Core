import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import EnrollmentTable from "./EnrollmentTable";

interface Enrollment {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  courseId: { _id: string; title: string; schedule: string };
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

export default async function EnrollmentsPage() {
  const api = await getServerApi();
  const [userRes, enrollmentsRes] = await Promise.all([
    api.get<AuthUser>("/auth/me"),
    api.get<Enrollment[]>("/admin/enrollments"),
  ]);

  if (!userRes.success || !userRes.data) redirect("/login");

  const user = userRes.data;
  const enrollments: Enrollment[] = enrollmentsRes.data ?? [];

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
