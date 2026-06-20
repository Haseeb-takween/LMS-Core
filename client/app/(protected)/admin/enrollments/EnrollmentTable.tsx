"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Enrollment {
  _id: string;
  studentId: { _id: string; name: string; email: string } | null;
  courseId:  { _id: string; title: string; schedule: string } | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
}

const FILTERS = ["all", "pending", "approved", "rejected"] as const;

const statusVariant = (s: string) =>
  s === "approved" ? "default" as const : s === "pending" ? "secondary" as const : "destructive" as const;

export default function EnrollmentTable() {
  const [filter, setFilter] = useState("all");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  const [fetching, setFetching] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);

  async function fetchFiltered(f: string) {
    setFilter(f);
    setFetching(true);
    const path = f === "all" ? "/admin/enrollments" : `/admin/enrollments?status=${f}`;
    const res = await api.get<Enrollment[]>(path);
    if (res.success && res.data) setEnrollments(res.data);
    setFetching(false);
    setSlowLoad(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchFiltered("all");
    const timer = setTimeout(() => setSlowLoad(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setLoading((p) => ({ ...p, [id]: true }));
    const res = await api.patch(`/admin/enrollments/${id}/${action}`, {});
    if (res.success) {
      setRemoving((p) => new Set(p).add(id));
      setTimeout(() => {
        setEnrollments((prev) => prev.filter((e) => e._id !== id));
        setRemoving((p) => { const s = new Set(p); s.delete(id); return s; });
      }, 300);
    }
    setLoading((p) => ({ ...p, [id]: false }));
  }

  const visible = filter === "all" ? enrollments : enrollments.filter((e) => e.status === filter);

  return (
    <div className="animate-fade-in-up stagger-2">
      <div className="flex items-center gap-1 mb-6 bg-card rounded-lg p-1 w-fit shadow-md shadow-black/10">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => fetchFiltered(f)}
            className={`text-xs font-semibold tracking-wide uppercase px-4 py-2 rounded-md transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-150 btn-press ${
              filter === f
                ? "bg-secondary text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {fetching ? (
        <Card className="shadow-lg shadow-black/20 animate-fade-in-scale">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground font-medium">Loading…</p>
            {slowLoad && (
              <p className="text-xs text-muted-foreground/50 mt-2">
                Backend is starting up — this may take ~30s on first visit.
              </p>
            )}
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="shadow-lg shadow-black/20 animate-fade-in-scale">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              No {filter === "all" ? "" : filter} requests.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg shadow-black/20 overflow-hidden">
          <CardContent className="p-0">
            <div
              className="grid bg-secondary/30 border-b border-border px-5 py-3"
              style={{ gridTemplateColumns: "1fr 1fr 7rem 6rem 9rem" }}
            >
              {["Student", "Course", "Requested", "Status", "Actions"].map((h) => (
                <span key={h} className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            {visible.map((enr) => {
              const isRemoving = removing.has(enr._id);
              const isLoading = loading[enr._id];
              return (
                <div
                  key={enr._id}
                  className="grid items-center px-5 py-4 border-b border-border last:border-0 transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-300 row-highlight"
                  style={{
                    gridTemplateColumns: "1fr 1fr 7rem 6rem 9rem",
                    opacity: isRemoving ? 0 : 1,
                    transform: isRemoving ? "translateX(-8px)" : "none",
                  }}
                >
                  <div className="pr-3 min-w-0">
                    <p className="text-xs text-foreground truncate font-semibold">{enr.studentId?.name ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{enr.studentId?.email ?? ""}</p>
                  </div>
                  <p className="text-xs text-foreground truncate pr-3 font-medium">{enr.courseId?.title ?? "—"}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(enr.requestedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </p>
                  <Badge variant={statusVariant(enr.status)} className="text-[8px] tracking-widest uppercase w-fit font-mono badge-pop">
                    {enr.status}
                  </Badge>
                  <div className="flex gap-2">
                    {enr.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAction(enr._id, "approve")}
                          disabled={isLoading}
                          className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-md transition-[transform,box-shadow,border-color,opacity,background-color,color] disabled:opacity-40 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 hover:shadow-sm btn-press"
                        >
                          {isLoading ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleAction(enr._id, "reject")}
                          disabled={isLoading}
                          className="text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-md transition-[transform,box-shadow,border-color,opacity,background-color,color] disabled:opacity-40 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:shadow-sm btn-press"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
