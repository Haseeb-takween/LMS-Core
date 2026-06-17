import { redirect } from "next/navigation";
import { getServerApi } from "@/lib/api-server";
import AdminLogoutButton from "./logout-button";

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  latestJoin: string | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default async function AdminPage() {
  const api = await getServerApi();
  const [statsRes, usersRes] = await Promise.all([
    api.get<Stats>("/admin/stats"),
    api.get<User[]>("/admin/users"),
  ]);

  if (!statsRes.success || !usersRes.success) {
    redirect("/login");
  }

  const stats = statsRes.data!;
  const users = usersRes.data ?? [];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const statBlocks = [
    { label: "Total users", value: stats.totalUsers },
    { label: "Total admins", value: stats.totalAdmins },
    {
      label: "Latest join",
      value: stats.latestJoin ? formatDate(stats.latestJoin) : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* ── Top nav ── */}
      <header className="bg-[#12121a] border-b border-[#1e1e2e] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-syne)] text-sm font-bold text-[#e8e8f0]">
            LMS Core
          </span>
          <span className="w-px h-4 bg-[#1e1e2e]" />
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#4f8ef7]">
            Admin Panel
          </span>
        </div>
        <AdminLogoutButton />
      </header>

      {/* ── Stats bar ── */}
      <div className="bg-[#12121a] border-b border-[#1e1e2e] px-8 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 sm:gap-12">
          {statBlocks.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
                {label}
              </span>
              <span className="font-[family-name:var(--font-syne)] text-2xl font-bold text-[#e8e8f0]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-syne)] text-base font-semibold text-[#e8e8f0]">
            Registered Users
          </h2>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#6b6b80]">
            {users.length} record{users.length !== 1 ? "s" : ""}
          </span>
        </div>

        {users.length === 0 ? (
          /* Empty state */
          <div className="border border-[#1e1e2e] bg-[#12121a] flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-px bg-[#1e1e2e]" />
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">
              No users yet
            </p>
            <div className="w-8 h-px bg-[#1e1e2e]" />
          </div>
        ) : (
          /* Table */
          <div className="border border-[#1e1e2e] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 bg-[#12121a] border-b border-[#1e1e2e] px-6 py-3">
              {["Name", "Email", "Joined"].map((col) => (
                <span
                  key={col}
                  className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80]"
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Table rows */}
            {users.map((user, idx) => (
              <div
                key={user._id}
                className="grid grid-cols-3 px-6 py-4 border-b border-[#1e1e2e] last:border-0 transition-colors duration-150"
                style={{ background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
              >
                <span className="font-[family-name:var(--font-syne)] text-sm text-[#e8e8f0] truncate pr-4">
                  {user.name}
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80] truncate pr-4">
                  {user.email}
                </span>
                <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="px-8 py-4 border-t border-[#1e1e2e]">
        <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80]">
          LMS Core v1.0 — Admin Access
        </p>
      </footer>
    </div>
  );
}
