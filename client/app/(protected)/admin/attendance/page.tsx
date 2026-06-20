"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface AttendanceRow {
  enrollmentId: string;
  student: { _id: string; name: string; email: string } | null;
  course: { _id: string; title: string } | null;
  attendancePercent: number;
  attendedCount: number;
  totalSessions: number;
}

interface Course {
  _id: string;
  title: string;
}

type SortKey = "name" | "attendancePercent";
type SortDir = "asc" | "desc";

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    api.get<Course[]>("/courses").then((res) => {
      if (res.success && res.data) setCourses(res.data);
    });
  }, []);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (courseFilter !== "all") params.set("courseId", courseFilter);
    params.set("sortBy", sortBy);
    params.set("order", sortDir);
    const res = await api.get<AttendanceRow[]>(`/admin/attendance?${params}`);
    if (res.success && res.data) setRows(res.data);
    setLoading(false);
  }, [courseFilter, sortBy, sortDir]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  function toggleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.email?.toLowerCase().includes(q)
    );
  });

  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <AdminShell user={user}>
      <main className="flex-1 px-6 sm:px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="mb-8">
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground mb-1 tracking-widest uppercase">
            Admin / Attendance
          </p>
          <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-foreground">
            Attendance Overview
          </h1>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-6 justify-between">
          <input
            type="text"
            placeholder="Search student…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] bg-card border border-border text-foreground placeholder:text-muted-foreground px-4 py-2.5 outline-none focus:border-primary/40 transition-colors rounded-lg w-52 shadow-sm"
          />

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] bg-card border border-border text-foreground px-4 py-2.5 outline-none focus:border-primary/40 transition-colors appearance-none cursor-pointer rounded-lg shadow-sm"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <Card className="shadow-lg shadow-black/20">
            <CardContent className="py-10 text-center">
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">Loading…</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="shadow-lg shadow-black/20">
            <CardContent className="py-10 text-center">
              <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-muted-foreground">No records found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg shadow-black/20 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid bg-secondary/30 border-b border-border px-5 py-3"
                style={{ gridTemplateColumns: "1fr 1fr 7rem 8rem" }}>
                <button
                  onClick={() => toggleSort("name")}
                  className={`font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-left flex items-center gap-1 hover:text-foreground transition-colors ${
                    sortBy === "name" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Student {sortBy === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                  Course
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-muted-foreground">
                  Sessions
                </span>
                <button
                  onClick={() => toggleSort("attendancePercent")}
                  className={`font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase flex items-center gap-1 hover:text-foreground transition-colors ${
                    sortBy === "attendancePercent" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Attendance {sortBy === "attendancePercent" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              </div>

              {filtered.map((row) => {
                const s = row.student;
                const c = row.course;
                const pct = row.attendancePercent;
                const barColor = pct >= 80 ? "#1d4ed8" : pct >= 50 ? "#d97706" : "#dc2626";

                return (
                  <div
                    key={String(row.enrollmentId)}
                    className="grid items-center px-5 py-4 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    style={{ gridTemplateColumns: "1fr 1fr 7rem 8rem" }}
                  >
                    <div className="pr-3 min-w-0">
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate">{s?.name ?? "—"}</p>
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-muted-foreground truncate">{s?.email ?? ""}</p>
                    </div>
                    <div className="pr-3 min-w-0">
                      <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-foreground truncate">{c?.title ?? "—"}</p>
                      <Link
                        href={`/admin/courses/${c?._id ?? ""}/roster`}
                        className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-primary hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
                      >
                        View roster <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                    <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">
                      {row.attendedCount}/{row.totalSessions}
                    </p>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold"
                          style={{ color: barColor }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-500 rounded-full"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="px-8 py-4 border-t border-border">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-muted-foreground">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </AdminShell>
  );
}
