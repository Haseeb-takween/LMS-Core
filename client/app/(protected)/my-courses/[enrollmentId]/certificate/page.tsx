import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerApi } from "@/lib/api-server";
import { type AuthUser, type CertificateData, RAW_API_URL } from "@/lib/api";
import Navbar from "../../../_components/Navbar";
import AnimatedBar from "../../../_components/AnimatedBar";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;
  const api = await getServerApi();

  const [userRes, certRes] = await Promise.all([
    api.get<AuthUser>("/auth/me"),
    api.get<CertificateData>(`/enrollments/${enrollmentId}/certificate`),
  ]);

  if (!userRes.success || !userRes.data) redirect("/login");

  const user = userRes.data;
  const cert: CertificateData = certRes.data ?? {
    status: "not_eligible",
    attendancePercent: 0,
    quizAverage: 0,
    attendanceThreshold: 80,
    quizThreshold: 70,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-2xl w-full mx-auto px-8 py-16 flex flex-col items-center justify-center">
        <div className="mb-8 self-start">
          <Link
            href={`/my-courses/${enrollmentId}`}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80] hover:text-[#e8e8f0] transition-colors"
          >
            ← Course
          </Link>
        </div>

        <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#e8e8f0] mb-8 self-start">
          Certificate
        </h1>

        {cert.status === "not_eligible" && (
          <div className="w-full border border-[#1e1e2e] p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#6b6b80]" />
              <p className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
                Not yet eligible
              </p>
            </div>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] leading-5">
              Complete the requirements below to qualify for a certificate.
            </p>

            {/* Attendance progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                  Attendance
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0]">
                  {cert.attendancePercent}% / {cert.attendanceThreshold ?? 80}% required
                </span>
              </div>
              <AnimatedBar
                percent={cert.attendancePercent}
                color={cert.attendancePercent >= (cert.attendanceThreshold ?? 80) ? "#1d4ed8" : "#d97706"}
                height="4px"
              />
            </div>

            {/* Quiz progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                  Quiz Average
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0]">
                  {cert.quizAverage}% / {cert.quizThreshold ?? 70}% required
                </span>
              </div>
              <AnimatedBar
                percent={cert.quizAverage}
                color={cert.quizAverage >= (cert.quizThreshold ?? 70) ? "#1d4ed8" : "#d97706"}
                height="4px"
              />
            </div>
          </div>
        )}

        {cert.status === "pending_approval" && (
          <div
            className="w-full border p-8 flex flex-col gap-4"
            style={{ borderColor: "rgba(217,119,6,0.35)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-2 py-1 animate-pulse"
                style={{
                  color: "#d97706",
                  background: "rgba(217,119,6,0.08)",
                  border: "1px solid rgba(217,119,6,0.3)",
                }}
              >
                Pending Approval
              </span>
            </div>
            <p className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
              Your certificate is awaiting admin review
            </p>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] leading-5">
              You have met all requirements. An admin will review and approve your
              certificate shortly.
            </p>
            <div className="flex gap-8 pt-2 border-t border-[#1e1e2e]">
              <div>
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-0.5">
                  Attendance
                </p>
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-[#d97706]">
                  {cert.attendancePercent}%
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-0.5">
                  Quiz Avg
                </p>
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-[#d97706]">
                  {cert.quizAverage}%
                </p>
              </div>
            </div>
          </div>
        )}

        {cert.status === "approved" && (
          <div
            className="w-full border p-8 flex flex-col gap-5"
            style={{ borderColor: "rgba(29,78,216,0.4)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-2 py-1"
                style={{
                  color: "#1d4ed8",
                  background: "rgba(29,78,216,0.08)",
                  border: "1px solid rgba(29,78,216,0.3)",
                }}
              >
                Approved
              </span>
            </div>

            <p className="font-[family-name:var(--font-syne)] text-xl font-bold text-[#e8e8f0]">
              Certificate of Completion
            </p>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] leading-5">
              Congratulations! Your certificate has been approved.
              {cert.approvedAt && (
                <> Issued on {new Date(cert.approvedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</>
              )}
            </p>

            <div className="flex gap-8 py-4 border-y border-[#1e1e2e]">
              <div>
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-0.5">
                  Attendance
                </p>
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-[#1d4ed8]">
                  {cert.attendancePercent}%
                </p>
              </div>
              <div>
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] mb-0.5">
                  Quiz Avg
                </p>
                <p className="font-[family-name:var(--font-syne)] text-lg font-bold text-[#1d4ed8]">
                  {cert.quizAverage}%
                </p>
              </div>
            </div>

            <a
              href={`${RAW_API_URL}/api/v1/enrollments/${enrollmentId}/certificate/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase px-6 py-3 bg-[#1d4ed8] text-white hover:opacity-90 transition-opacity"
            >
              Download PDF →
            </a>
          </div>
        )}

        {cert.status === "rejected" && (
          <div
            className="w-full border p-8 flex flex-col gap-4"
            style={{ borderColor: "rgba(220,38,38,0.35)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-2 py-1"
                style={{
                  color: "#dc2626",
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.3)",
                }}
              >
                Rejected
              </span>
            </div>
            <p className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
              Certificate not approved
            </p>
            {cert.rejectionReason && (
              <div
                className="font-[family-name:var(--font-ibm-plex-mono)] text-xs px-4 py-3 leading-5"
                style={{
                  color: "#e8e8f0",
                  background: "rgba(220,38,38,0.06)",
                  borderLeft: "2px solid #dc2626",
                }}
              >
                {cert.rejectionReason}
              </div>
            )}
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
              Please contact your instructor for more information.
            </p>
          </div>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Academic Edition
        </p>
      </footer>
    </div>
  );
}
