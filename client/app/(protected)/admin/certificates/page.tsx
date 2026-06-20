"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AdminShell from "../_components/AdminShell";
import CertificateTable from "./CertificateTable";

export default function CertificatesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

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

        <CertificateTable />
      </main>

      <footer className="px-8 py-4 border-t border-border">
        <p className="font-mono text-[10px] text-muted-foreground">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
