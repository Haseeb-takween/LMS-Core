"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

const NAV = [
  { abbr: "DA", label: "Dashboard",    href: "/admin",               exact: true  },
  { abbr: "EN", label: "Enrollments",  href: "/admin/enrollments",   exact: false },
  { abbr: "AT", label: "Attendance",   href: "/admin/attendance",    exact: false },
  { abbr: "QZ", label: "Quiz Results", href: "/admin/quiz-results",  exact: false },
  { abbr: "CE", label: "Certificates", href: "/admin/certificates",  exact: false },
] as const;

interface Stats {
  pendingEnrollments: number;
  pendingCertificates: number;
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [badges, setBadges] = useState<Stats>({
    pendingEnrollments: 0,
    pendingCertificates: 0,
  });

  useEffect(() => {
    api.get<Stats>("/admin/stats").then((res) => {
      if (res.success && res.data) setBadges(res.data);
    });
  }, []);

  const badgeMap: Record<string, number> = {
    "/admin/enrollments": badges.pendingEnrollments,
    "/admin/certificates": badges.pendingCertificates,
  };

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside
        className="fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col z-40 overflow-hidden shadow-2xl shadow-black/30 animate-slide-in-left"
        style={{
          width: expanded ? 240 : 64,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="flex items-center border-b border-border" style={{ height: 60 }}>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-[64px] h-full shrink-0 flex items-center justify-center hover:bg-secondary/50 transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200 btn-press"
          >
            {expanded ? (
              <PanelLeftClose className="w-5 h-5 text-primary" />
            ) : (
              <PanelLeft className="w-5 h-5 text-primary" />
            )}
          </button>
          <div
            className="overflow-hidden whitespace-nowrap transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200"
            style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-8px)" }}
          >
            <p className="font-[family-name:var(--font-syne)] text-base font-extrabold text-foreground tracking-tight">
              LMS Core
            </p>
            <p className="text-xs tracking-wide uppercase text-primary font-bold">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex-1 py-3 flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const badge = badgeMap[item.href] ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center h-12 transition-[background-color] duration-200 relative group/nav ${
                  active ? "bg-primary/5" : "hover:bg-secondary/30"
                }`}
              >
                <div className="w-[64px] shrink-0 flex items-center justify-center relative">
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 bg-primary rounded-r-full shadow-lg shadow-primary/20" style={{ width: 3, height: 20 }} />
                  )}
                  <span
                    className={`text-xs tracking-widest font-extrabold transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200 ${
                      active ? "text-primary scale-110" : "text-muted-foreground group-hover/nav:text-foreground"
                    }`}
                  >
                    {item.abbr}
                  </span>
                  {!expanded && badge > 0 && (
                    <Badge variant="secondary" className="absolute top-1 right-1 text-[8px] px-1.5 h-4 min-w-0 text-amber-500 badge-pop animate-pulse-glow font-bold">
                      {badge}
                    </Badge>
                  )}
                </div>

                <div
                  className="flex-1 flex items-center justify-between pr-4 overflow-hidden whitespace-nowrap transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200"
                  style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-8px)" }}
                >
                  <span
                    className={`text-sm tracking-wide uppercase font-bold transition-colors duration-200 ${
                      active ? "text-foreground" : "text-muted-foreground group-hover/nav:text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {badge > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-2 h-5 min-w-0 text-amber-500 badge-pop font-bold">
                      {badge}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border" />

        <div className="py-3">
          <div
            className="px-4 py-1 overflow-hidden whitespace-nowrap transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200"
            style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-8px)" }}
          >
            <p className="text-sm text-muted-foreground truncate font-semibold">
              {user.name}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center h-12 w-full hover:bg-destructive/10 transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200 group/logout btn-press"
          >
            <div className="w-[64px] shrink-0 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-destructive group-hover/logout:scale-110 transition-transform duration-200" />
            </div>
            <span
              className="text-sm tracking-wide uppercase text-destructive whitespace-nowrap font-bold transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-200"
              style={{ opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-8px)" }}
            >
              Sign out
            </span>
          </button>
        </div>
      </aside>

      <div
        className="flex-1 min-w-0 flex flex-col"
        style={{
          marginLeft: expanded ? 240 : 64,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
