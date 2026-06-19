"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, AuthUser } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<AuthUser>("/auth/login", { email, password });
      if (!res.success || !res.data) {
        setError(res.message || "Login failed");
        return;
      }
      router.push(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden bg-card border-r border-border">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lg" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#4f8ef7" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lg)" />
        </svg>

        <div
          className="absolute -right-32 top-1/4 w-64 h-64 rounded-full opacity-10 animate-gradient-shift"
          style={{ background: "radial-gradient(circle, #4f8ef7, transparent 70%)", backgroundSize: "200% 200%" }}
        />

        <div
          className="absolute -right-16 top-0 bottom-0 w-32 opacity-20"
          style={{ background: "linear-gradient(180deg, #4f8ef7 0%, transparent 60%)" }}
        />

        <div className="animate-fade-in-up">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary font-semibold">
            LMS Core
          </span>
          <div className="mt-2 w-6 h-px bg-primary" />
        </div>

        <div className="animate-fade-in-up stagger-2">
          <h1 className="font-[family-name:var(--font-syne)] text-[3.5rem] font-extrabold leading-[1.05] text-foreground mb-6 tracking-tight">
            Knowledge,<br />
            <span className="text-primary">structured.</span>
          </h1>
          <p className="text-sm leading-6 text-muted-foreground font-medium">
            A unified platform for learning,<br />
            tracking progress, and growing.
          </p>
        </div>

        <div className="flex items-center gap-2 animate-fade-in-up stagger-4">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-dot-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            v1.0 — Academic Edition
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[340px]">
          <div className="lg:hidden mb-10 animate-fade-in-up">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary font-semibold">
              LMS Core
            </span>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              Knowledge, structured.
            </h2>
          </div>

          <div className="mb-10 animate-fade-in-up stagger-1">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground mb-1 tracking-tight">
              Sign in
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="animate-fade-in-up stagger-2">
              <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground block mb-2 font-semibold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                placeholder="you@example.com"
                className="w-full bg-transparent px-0 py-2.5 text-sm outline-none placeholder-muted-foreground/40 input-glow font-medium"
                style={{
                  color: "var(--foreground)",
                  borderBottom: `1px solid ${focused === "email" ? "var(--primary)" : "var(--border)"}`,
                  transition: "border-color 0.3s ease",
                }}
              />
            </div>

            <div className="animate-fade-in-up stagger-3">
              <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground block mb-2 font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                required
                placeholder="••••••••"
                className="w-full bg-transparent px-0 py-2.5 text-sm outline-none placeholder-muted-foreground/40 input-glow font-medium"
                style={{
                  color: "var(--foreground)",
                  borderBottom: `1px solid ${focused === "password" ? "var(--primary)" : "var(--border)"}`,
                  transition: "border-color 0.3s ease",
                }}
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2 bg-destructive/5 border-l-2 border-destructive text-destructive rounded-r-lg animate-fade-in-down font-medium">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up stagger-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-xs font-bold tracking-[0.25em] uppercase bg-primary text-primary-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 btn-press flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in →"
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-border animate-fade-in-up stagger-5">
            <p className="text-sm text-center text-muted-foreground font-medium">
              No account?{" "}
              <Link href="/register" className="text-primary hover:opacity-80 transition-opacity font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
