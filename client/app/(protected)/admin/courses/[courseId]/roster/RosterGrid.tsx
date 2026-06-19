"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface SessionCol {
  _id: string;
  lessonNumber: number;
  title: string;
  order: number;
}

interface StudentRow {
  student: { _id: string; name: string; email: string };
  enrollmentId: string;
  attendance: Record<string, string | null>;
  attendancePercent: number;
}

interface RosterGridProps {
  courseId: string;
  sessions: SessionCol[];
  initialStudents: StudentRow[];
}

type CellStatus = "attended" | "missed" | null;

function nextStatus(s: CellStatus): "attended" | "missed" {
  return s === "attended" ? "missed" : "attended";
}

const CELL_COLOR: Record<string, string> = {
  attended: "#1d4ed8",
  missed: "#dc2626",
};

export default function RosterGrid({
  sessions,
  initialStudents,
}: RosterGridProps) {
  const [students, setStudents] = useState<StudentRow[]>(initialStudents);
  const [pending, setPending] = useState<Set<string>>(new Set());

  async function toggleCell(
    enrollmentId: string,
    sessionId: string,
    current: CellStatus
  ) {
    const key = `${enrollmentId}::${sessionId}`;
    if (pending.has(key)) return;

    const newStatus = nextStatus(current);
    setPending((p) => new Set(p).add(key));

    const newStudents = students.map((row) => {
      if (String(row.enrollmentId) !== enrollmentId) return row;
      const updated = { ...row.attendance, [sessionId]: newStatus };
      const attended = Object.values(updated).filter((s) => s === "attended").length;
      const percent =
        sessions.length > 0 ? Math.round((attended / sessions.length) * 100) : 0;
      return { ...row, attendance: updated, attendancePercent: percent };
    });

    setStudents(newStudents);

    const res = await api.post("/admin/attendance", {
      enrollmentId,
      sessionId,
      status: newStatus,
    });

    if (!res.success) {
      setStudents(students);
    }

    setPending((p) => {
      const s = new Set(p);
      s.delete(key);
      return s;
    });
  }

  if (students.length === 0) {
    return (
      <div className="border border-[#1e1e2e] px-6 py-10 text-center">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">
          No approved students enrolled in this course.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse w-full min-w-max">
        <thead>
          <tr>
            <th
              className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-[#6b6b80] text-left px-4 py-3 bg-[#12121a] border border-[#1e1e2e] sticky left-0 z-10"
              style={{ minWidth: 180 }}
            >
              Student
            </th>
            {sessions.map((s) => (
              <th
                key={s._id}
                className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-[#6b6b80] px-2 py-3 bg-[#12121a] border border-[#1e1e2e] text-center"
                style={{ minWidth: 56 }}
              >
                L{s.lessonNumber}
              </th>
            ))}
            <th className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] tracking-widest uppercase text-[#6b6b80] px-4 py-3 bg-[#12121a] border border-[#1e1e2e] text-right">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((row) => (
            <tr key={String(row.enrollmentId)} className="hover:bg-[#0f0f17] transition-colors">
              <td
                className="px-4 py-3 border border-[#1e1e2e] bg-[#0a0a0f] sticky left-0 z-10"
                style={{ minWidth: 180 }}
              >
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0] whitespace-nowrap">
                  {row.student.name}
                </p>
                <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[9px] text-[#6b6b80] whitespace-nowrap">
                  {row.student.email}
                </p>
              </td>
              {sessions.map((s) => {
                const status = (row.attendance[s._id] ?? null) as CellStatus;
                const key = `${String(row.enrollmentId)}::${s._id}`;
                const isLoading = pending.has(key);

                return (
                  <td
                    key={s._id}
                    className="border border-[#1e1e2e] text-center p-0"
                    style={{ minWidth: 56, height: 44 }}
                  >
                    <button
                      onClick={() => toggleCell(String(row.enrollmentId), s._id, status)}
                      disabled={isLoading}
                      className="w-full h-full flex items-center justify-center transition-colors hover:opacity-80 disabled:opacity-40"
                      style={{
                        background: status ? `${CELL_COLOR[status]}14` : "transparent",
                      }}
                    >
                      {isLoading ? (
                        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] text-[#6b6b80]">
                          …
                        </span>
                      ) : status ? (
                        <span
                          className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] font-semibold tracking-widest uppercase"
                          style={{ color: CELL_COLOR[status] }}
                        >
                          {status === "attended" ? "AT" : "MI"}
                        </span>
                      ) : (
                        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[8px] text-[#2a2a3e]">
                          —
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
              <td className="px-4 py-3 border border-[#1e1e2e] text-right">
                <span
                  className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold"
                  style={{
                    color:
                      row.attendancePercent >= 80
                        ? "#1d4ed8"
                        : row.attendancePercent >= 50
                        ? "#d97706"
                        : "#dc2626",
                  }}
                >
                  {row.attendancePercent}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
