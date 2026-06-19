"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  const fields: { id: string; label: string; type: string; placeholder: string; autoComplete: string }[] = [
    { id: "name", label: "Full name", type: "text", placeholder: "Your name", autoComplete: "name" },
    { id: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { id: "password", label: "Password", type: "password", placeholder: "Min. 6 characters", autoComplete: "new-password" },
    { id: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
  ];

  return (
    <div className="min-h-dvh flex bg-background">
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-16 order-1 lg:order-none">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden mb-10 animate-fade-in-up">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-bold">
              LMS Core
            </span>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground mt-1 tracking-tight">
              Create account
            </h2>
          </div>

          <div className="mb-10 animate-fade-in-up stagger-1">
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-extrabold text-foreground mb-2 tracking-tight">
              Create account
            </h2>
            <p className="text-base text-muted-foreground font-medium">
              Fill in the fields below to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            {fields.map((f, i) => {
              const isPassword = f.type === "password";
              return (
                <div key={f.id} className={`animate-fade-in-up stagger-${Math.min(i + 2, 8)}`}>
                  <label htmlFor={`reg-${f.id}`} className="text-xs tracking-[0.2em] uppercase text-muted-foreground block mb-2 font-bold">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      id={`reg-${f.id}`}
                      type={isPassword && showPassword ? "text" : f.type}
                      autoComplete={f.autoComplete}
                      value={form[f.id as keyof typeof form]}
                      onChange={handleChange(f.id)}
                      onFocus={() => setFocused(f.id)}
                      onBlur={() => setFocused(null)}
                      required
                      placeholder={f.placeholder}
                      className="w-full bg-transparent px-0 py-3 text-base outline-none placeholder-muted-foreground/40 font-medium border-b-2 transition-colors duration-300"
                      style={{
                        borderBottomColor: focused === f.id ? "var(--primary)" : "var(--border)",
                        paddingRight: isPassword ? "2.5rem" : undefined,
                      }}
                    />
                    {isPassword && f.id === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {error && (
              <div role="alert" className="text-sm px-4 py-3 bg-destructive/5 border-l-2 border-destructive text-destructive rounded-r-lg animate-fade-in-down font-semibold">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up stagger-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-sm font-bold tracking-[0.2em] uppercase bg-primary text-primary-foreground transition-[transform,box-shadow,opacity] duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 btn-press flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  "Create account →"
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-border animate-fade-in-up stagger-7">
            <p className="text-base text-center text-muted-foreground font-medium">
              Already registered?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-14 relative overflow-hidden bg-card border-l border-border order-2">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#4f8ef7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div
          className="absolute left-1/4 bottom-1/4 w-72 h-72 rounded-full opacity-10 animate-gradient-shift"
          style={{ background: "radial-gradient(circle, #4f8ef7, transparent 70%)", backgroundSize: "200% 200%" }}
          aria-hidden="true"
        />

        <div
          className="absolute left-0 top-0 bottom-0 w-px opacity-40"
          style={{ background: "linear-gradient(180deg, transparent, #4f8ef7 40%, transparent)" }}
          aria-hidden="true"
        />

        <div className="animate-fade-in-up relative z-10">
          <span className="text-xs tracking-[0.3em] uppercase text-primary font-bold">
            LMS Core
          </span>
          <div className="mt-2 w-6 h-px bg-primary" />
        </div>

        <div className="animate-fade-in-up stagger-2 relative z-10">
          <h1 className="font-[family-name:var(--font-syne)] text-[3.5rem] font-extrabold leading-[1.05] text-foreground mb-6 tracking-tight">
            Start your<br />
            <span className="text-primary">journey.</span>
          </h1>
          <p className="text-base leading-7 text-muted-foreground font-medium max-w-[320px]">
            Access courses, track progress, and build your future.
          </p>
        </div>

        <div className="space-y-4">
          {[
            ["01", "Structured learning paths"],
            ["02", "Progress tracking"],
            ["03", "Admin oversight"],
          ].map(([num, label], i) => (
            <div key={num} className={`flex items-center gap-4 animate-fade-in-up stagger-${i + 3}`}>
              <span className="text-sm text-primary font-extrabold">{num}</span>
              <span className="text-base text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
