"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  initialStatus: "pending" | "approved" | "rejected" | null;
}

export default function EnrollButton({ courseId, initialStatus }: EnrollButtonProps) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnroll() {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/enrollments", { courseId });
      if (res.success) {
        setStatus("pending");
      } else {
        setError(res.message || "Failed to enroll");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "approved") {
    return (
      <Badge variant="default" className="gap-1.5 badge-pop font-bold text-xs px-3 py-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Approved
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge variant="secondary" className="gap-1.5 badge-pop animate-pulse-glow font-bold text-xs px-3 py-1.5">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge variant="destructive" className="gap-1.5 badge-pop font-bold text-xs px-3 py-1.5">
        <XCircle className="w-3.5 h-3.5" />
        Rejected
      </Badge>
    );
  }

  return (
    <div>
      {error && (
        <p className="text-sm text-destructive mb-2 animate-fade-in-down font-semibold">
          {error}
        </p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleEnroll(); }}
        disabled={loading}
        className="text-sm font-bold tracking-wider uppercase px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-[transform,box-shadow,border-color,opacity,background-color,color] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 btn-press flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Requesting…
          </>
        ) : (
          "Request Enrollment →"
        )}
      </button>
    </div>
  );
}
