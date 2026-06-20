"use client";

import { useAuth } from "@/lib/auth-context";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80] border border-[#1e1e2e] px-4 py-2 hover:border-[#4f8ef7] hover:text-[#4f8ef7] transition-colors duration-200"
    >
      Sign out
    </button>
  );
}
