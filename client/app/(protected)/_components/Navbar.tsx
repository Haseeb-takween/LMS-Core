"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { type Course } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { LogOut, ChevronDown } from "lucide-react";

interface NavbarProps {
  user: { name: string; email: string; role: string };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const { enrollments, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`relative text-sm font-bold tracking-wide transition-colors duration-200 group/nav py-4 ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <span
          className="absolute bottom-0 left-0 h-[2px] bg-primary transition-[transform,box-shadow,border-color,color] duration-300 rounded-full"
          style={{ width: active ? "100%" : "0%", opacity: active ? 1 : 0 }}
        />
        <span className="absolute bottom-0 left-0 h-[2px] bg-primary/40 transition-[width,opacity] duration-300 rounded-full group-hover/nav:w-full group-hover/nav:opacity-100"
          style={{ width: "0%", opacity: 0 }}
        />
      </Link>
    );
  };

  const statusVariant = (s: string) =>
    s === "approved" ? "default" : s === "pending" ? "secondary" : "destructive";

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border px-8 py-0 flex items-stretch justify-between sticky top-0 z-50 shadow-lg shadow-black/10 animate-fade-in-down">
      <div className="flex items-stretch gap-0">
        <Link
          href="/dashboard"
          className="flex items-center pr-6 border-r border-border mr-6 group/brand"
        >
          <span className="font-[family-name:var(--font-syne)] text-lg font-extrabold text-foreground tracking-tight">
            LMS<span className="text-primary">.</span>Core
          </span>
        </Link>

        <nav className="flex items-stretch gap-6">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/courses", "Courses")}

          <div ref={dropdownRef} className="relative flex items-center">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              className={`text-sm font-bold tracking-wide transition-colors duration-200 flex items-center gap-1.5 ${
                pathname.startsWith("/my-courses") ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Courses
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-[260px] bg-card rounded-xl border border-border z-50 shadow-2xl shadow-black/40 overflow-hidden animate-fade-in-down">
                {enrollments.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-muted-foreground font-medium">
                    No enrollments yet
                  </div>
                ) : (
                  enrollments.map((enr, i) => {
                    const course = enr.courseId as Course;
                    return (
                      <Link
                        key={enr._id}
                        href={enr.status === "approved" ? `/my-courses/${enr._id}` : "#"}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0 hover:bg-secondary/50 transition-[transform,box-shadow,border-color,opacity,background-color,color] duration-150 row-highlight animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
                      >
                        <span className="text-sm text-foreground truncate max-w-[160px] font-semibold">
                          {typeof course === "object" ? course.title : "Course"}
                        </span>
                        <Badge variant={statusVariant(enr.status)} className="text-[9px] tracking-widest uppercase ml-2 shrink-0 badge-pop font-bold">
                          {enr.status}
                        </Badge>
                      </Link>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden sm:block font-semibold">
          {user.name}
        </span>
        <button
          onClick={logout}
          className="text-sm font-bold tracking-wide text-muted-foreground border border-border rounded-lg px-5 py-2.5 hover:border-primary hover:text-primary transition-[transform,box-shadow,border-color,color] duration-300 flex items-center gap-2 hover:shadow-md hover:shadow-primary/10 btn-press"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
