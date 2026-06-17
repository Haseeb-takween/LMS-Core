"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, AuthUser } from "@/lib/api";

export default function AdminLoginPage() {
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
      const res = await api.post<AuthUser>("/admin/login", { email, password });
      if (!res.success || !res.data) {
        setError(res.message || "Invalid credentials");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full bg-transparent px-0 py-2.5 text-sm outline-none transition-colors duration-200 placeholder-[#3a3a50]";

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden bg-[#12121a] border-r border-[#1e1e2e]">
        {/* Grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ag" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#4f8ef7" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ag)" />
        </svg>

        <div
          className="absolute -right-16 top-0 bottom-0 w-32 opacity-20"
          style={{ background: "linear-gradient(180deg, #4f8ef7 0%, transparent 60%)" }}
        />

        {/* Brand mark */}
        <div>
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.3em] uppercase text-[#4f8ef7]">
            LMS Core
          </span>
          <div className="mt-2 w-6 h-px bg-[#4f8ef7]" />
        </div>

        {/* Hero text */}
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-[3.5rem] font-extrabold leading-[1.05] text-[#e8e8f0] mb-6">
            Admin<br />
            <span className="text-[#4f8ef7]">access.</span>
          </h1>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs leading-6 text-[#6b6b80]">
            Restricted to authorised<br />
            administrators only.
          </p>
        </div>

        {/* Warning tag */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#f87171]" />
          <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] tracking-widest uppercase">
            Restricted area
          </span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-[340px]">

          {/* Mobile brand */}
          <div className="lg:hidden mb-10">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.3em] uppercase text-[#4f8ef7]">
              LMS Core
            </span>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[#e8e8f0] mt-1">
              Admin access
            </h2>
          </div>

          {/* Restricted badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 px-3 py-1.5"
            style={{
              background: "rgba(248,113,113,0.07)",
              border: "1px solid rgba(248,113,113,0.2)",
            }}
          >
            <div className="w-1 h-1 bg-[#f87171]" />
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-widest uppercase text-[#f87171]">
              Admin only
            </span>
          </div>

          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold text-[#e8e8f0] mb-1">
              Admin sign in
            </h2>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">
              Enter your admin credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email */}
            <div>
              <label className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80] block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                required
                placeholder="admin@example.com"
                className={inputBase}
                style={{
                  color: "#e8e8f0",
                  fontFamily: "var(--font-ibm-plex-mono)",
                  borderBottom: `1px solid ${focused === "email" ? "#4f8ef7" : "#1e1e2e"}`,
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80] block mb-2">
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
                className={inputBase}
                style={{
                  color: "#e8e8f0",
                  fontFamily: "var(--font-ibm-plex-mono)",
                  borderBottom: `1px solid ${focused === "password" ? "#4f8ef7" : "#1e1e2e"}`,
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="font-[family-name:var(--font-ibm-plex-mono)] text-xs px-3 py-2"
                style={{
                  color: "#f87171",
                  background: "rgba(248,113,113,0.07)",
                  borderLeft: "2px solid #f87171",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-semibold tracking-[0.25em] uppercase bg-[#4f8ef7] text-[#0a0a0f] transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80"
            >
              {loading ? "Signing in…" : "Admin sign in →"}
            </button>
          </form>

          {/* Footer link */}
          <div className="mt-10 pt-6 border-t border-[#1e1e2e]">
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-center text-[#6b6b80]">
              Not an admin?{" "}
              <Link href="/login" className="text-[#4f8ef7] hover:opacity-80 transition-opacity">
                User sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
