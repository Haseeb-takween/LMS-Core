"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      if (!res.success) {
        setError(res.message || "Registration failed");
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full bg-transparent px-0 py-2.5 text-sm outline-none transition-colors duration-200 placeholder-[#3a3a50]";

  const fields: { id: string; label: string; type: string; placeholder: string }[] = [
    { id: "name", label: "Full name", type: "text", placeholder: "Your name" },
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
    { id: "password", label: "Password", type: "password", placeholder: "Min. 6 characters" },
    { id: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* ── Left form panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 order-1 lg:order-none">
        <div className="w-full max-w-[340px]">

          {/* Mobile brand */}
          <div className="lg:hidden mb-10">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.3em] uppercase text-[#4f8ef7]">
              LMS Core
            </span>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-[#e8e8f0] mt-1">
              Create account
            </h2>
          </div>

          <div className="mb-10">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-semibold text-[#e8e8f0] mb-1">
              Create account
            </h2>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">
              Fill in the fields below to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((f) => (
              <div key={f.id}>
                <label className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80] block mb-2">
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={form[f.id as keyof typeof form]}
                  onChange={handleChange(f.id)}
                  onFocus={() => setFocused(f.id)}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder={f.placeholder}
                  className={inputBase}
                  style={{
                    color: "#e8e8f0",
                    fontFamily: "var(--font-ibm-plex-mono)",
                    borderBottom: `1px solid ${focused === f.id ? "#4f8ef7" : "#1e1e2e"}`,
                  }}
                />
              </div>
            ))}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] font-semibold tracking-[0.25em] uppercase bg-[#4f8ef7] text-[#0a0a0f] transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80"
            >
              {loading ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-[#1e1e2e]">
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-center text-[#6b6b80]">
              Already registered?{" "}
              <Link href="/login" className="text-[#4f8ef7] hover:opacity-80 transition-opacity">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden bg-[#12121a] border-l border-[#1e1e2e] order-2">
        {/* Dot grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#4f8ef7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        {/* Left accent stripe */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px opacity-40"
          style={{ background: "linear-gradient(180deg, transparent, #4f8ef7 40%, transparent)" }}
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
            Start your<br />
            <span className="text-[#4f8ef7]">journey.</span>
          </h1>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs leading-6 text-[#6b6b80]">
            Access courses, track progress,<br />
            and build your future.
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {[
            ["01", "Structured learning paths"],
            ["02", "Progress tracking"],
            ["03", "Admin oversight"],
          ].map(([num, label]) => (
            <div key={num} className="flex items-center gap-4">
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#4f8ef7]">{num}</span>
              <span className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#6b6b80]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
