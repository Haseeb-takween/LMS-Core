"use client";

import { api } from "@/lib/api";

export default function AdminLogoutButton() {
  async function handleLogout() {
    await api.post("/auth/logout", {});
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase text-[#6b6b80] border border-[#1e1e2e] px-4 py-2 hover:border-[#f87171] hover:text-[#f87171] transition-colors duration-200"
    >
      Sign out
    </button>
  );
}
