"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface CertificateTableProps {
  initialCertificates: Certificate[];
}

const FILTERS = [
  { key: "all",              label: "All"     },
  { key: "pending_approval", label: "Pending" },
  { key: "approved",         label: "Approved"},
  { key: "rejected",         label: "Rejected"},
] as const;

const statusVariant = (s: string) =>
  s === "approved" ? "default" as const : s === "pending_approval" ? "secondary" as const : "destructive" as const;

export default function CertificateTable({ initialCertificates }: CertificateTableProps) {
  const [filter, setFilter] = useState("all");
  const [certs, setCerts] = useState<Certificate[]>(initialCertificates);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  async function fetchFiltered(f: string) {
    setFilter(f);
    const path = f === "all" ? "/admin/certificates" : `/admin/certificates?status=${f}`;
    const res = await api.get<Certificate[]>(path);
    if (res.success && res.data) setCerts(res.data);
  }

  async function handleApprove(id: string) {
    setLoading((p) => ({ ...p, [id]: true }));
    const res = await api.patch(`/admin/certificates/${id}/approve`, {});
    if (res.success) animateRemove(id);
    setLoading((p) => ({ ...p, [id]: false }));
  }

  async function handleReject(id: string) {
    if (!reason.trim()) return;
    setLoading((p) => ({ ...p, [id]: true }));
    const res = await api.patch(`/admin/certificates/${id}/reject`, { reason: reason.trim() });
    if (res.success) {
      setExpanded(null);
      setReason("");
      animateRemove(id);
    }
    setLoading((p) => ({ ...p, [id]: false }));
  }

  function animateRemove(id: string) {
    setRemoving((p) => new Set(p).add(id));
    setTimeout(() => {
      setCerts((prev) => prev.filter((c) => c._id !== id));
      setRemoving((p) => { const s = new Set(p); s.delete(id); return s; });
    }, 300);
  }

  const visible = filter === "all" ? certs : certs.filter((c) =>
    filter === "pending_approval" ? c.status === "pending_approval" : c.status === filter
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 bg-card rounded-lg p-1 w-fit shadow-md shadow-black/10">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => fetchFiltered(f.key)}
            className={`font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase px-4 py-2 rounded-md transition-all duration-150 ${
              filter === f.key
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="shadow-lg shadow-black/20">
          <CardContent className="py-10 text-center">
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">
              No certificates found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg shadow-black/20 overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div className="grid bg-secondary/30 border-b border-border px-5 py-3"
              style={{ gridTemplateColumns: "1fr 1fr 5rem 5rem 6rem 9rem" }}>
              {["Student", "Course", "Attend%", "Quiz%", "Status", "Actions"].map((h) => (
                <span key={h} className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {visible.map((cert) => {
              const isRemoving = removing.has(cert._id);
              const isLoading = loading[cert._id];
              const isExpanded = expanded === cert._id;

              return (
                <div
                  key={cert._id}
                  className="transition-all duration-300 border-b border-border last:border-0"
                  style={{ opacity: isRemoving ? 0 : 1, transform: isRemoving ? "translateX(-8px)" : "none" }}
                >
                  <div
                    className="grid items-center px-5 py-4 hover:bg-secondary/20 transition-colors"
                    style={{ gridTemplateColumns: "1fr 1fr 5rem 5rem 6rem 9rem" }}
                  >
                    <div className="pr-3 min-w-0">
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate">{cert.studentId.name}</p>
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-muted-foreground truncate">{cert.studentId.email}</p>
                    </div>
                    <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate pr-3">{cert.courseId.title}</p>
                    <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px]"
                      style={{ color: cert.attendancePercent >= 80 ? "#1d4ed8" : "#d97706" }}>
                      {cert.attendancePercent}%
                    </p>
                    <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px]"
                      style={{ color: cert.quizAverage >= 70 ? "#1d4ed8" : "#d97706" }}>
                      {cert.quizAverage}%
                    </p>
                    <Badge variant={statusVariant(cert.status)} className="text-[8px] tracking-widest uppercase w-fit">
                      {cert.status === "pending_approval" ? "Pending" : cert.status}
                    </Badge>
                    <div className="flex gap-2">
                      {cert.status === "pending_approval" && (
                        <>
                          <button
                            onClick={() => handleApprove(cert._id)}
                            disabled={isLoading}
                            className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-md transition-all disabled:opacity-40 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-sm"
                          >
                            {isLoading ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() => setExpanded(isExpanded ? null : cert._id)}
                            disabled={isLoading}
                            className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-md transition-all disabled:opacity-40 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {cert.status === "rejected" && cert.rejectionReason && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : cert._id)}
                          className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? "Hide" : "Reason"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && cert.status === "pending_approval" && (
                    <div className="px-5 pb-4 flex items-start gap-3">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rejection reason (required)"
                        rows={2}
                        className="flex-1 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] bg-background border border-destructive/30 text-foreground px-3 py-2 outline-none placeholder:text-muted-foreground resize-none focus:border-destructive/60 rounded-lg"
                      />
                      <button
                        onClick={() => handleReject(cert._id)}
                        disabled={isLoading || !reason.trim()}
                        className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase px-4 py-2.5 rounded-md transition-all disabled:opacity-40 bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                      >
                        {isLoading ? "…" : "Confirm Reject"}
                      </button>
                    </div>
                  )}

                  {isExpanded && cert.status === "rejected" && cert.rejectionReason && (
                    <div className="px-5 pb-4">
                      <div className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] px-4 py-3 leading-5 text-foreground bg-destructive/5 border-l-2 border-destructive rounded-r-lg">
                        {cert.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
