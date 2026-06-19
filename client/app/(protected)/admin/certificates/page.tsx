import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import CertificateTable from "./CertificateTable";

interface Certificate {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  courseId: { _id: string; title: string; schedule: string };
  status: "pending_approval" | "approved" | "rejected";
  attendancePercent: number;
  quizAverage: number;
  createdAt: string;
  rejectionReason?: string;
}

export default async function CertificatesPage() {
  const api = await getServerApi();
  const [userRes, certsRes] = await Promise.all([
    api.get<AuthUser>("/auth/me"),
    api.get<Certificate[]>("/admin/certificates"),
  ]);

  if (!userRes.success || !userRes.data) redirect("/login");

  const user = userRes.data;
  const certificates: Certificate[] = certsRes.data ?? [];

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <p className="font-mono text-[10px] text-muted-foreground mb-1 tracking-widest uppercase">
            Admin / Certificates
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground tracking-tight">
            Certificate Requests
          </h1>
        </div>

        <CertificateTable initialCertificates={certificates} />
      </main>

      <footer className="px-8 py-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
