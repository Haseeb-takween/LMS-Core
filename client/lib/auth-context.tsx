"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type AuthUser, type Enrollment } from "./api";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  enrollments: Enrollment[];
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  enrollments: [],
  logout: async () => {},
});

const USER_KEY = "lms_user";
const ENROLLMENTS_KEY = "lms_enrollments";

function readCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T | null) {
  try {
    if (value !== null) {
      sessionStorage.setItem(key, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const router = useRouter();

  useEffect(() => {
    const cachedUser = readCache<AuthUser>(USER_KEY);
    const cachedEnrollments = readCache<Enrollment[]>(ENROLLMENTS_KEY);

    if (cachedUser) {
      setUser(cachedUser);
      setEnrollments(cachedEnrollments ?? []);
      setLoading(false);
    }

    api.get<AuthUser>("/auth/me")
      .then(async (authRes) => {
        if (!authRes.success || !authRes.data) {
          writeCache(USER_KEY, null);
          writeCache(ENROLLMENTS_KEY, null);
          router.replace("/login");
          return;
        }

        const freshUser = authRes.data;
        setUser(freshUser);
        writeCache(USER_KEY, freshUser);

        if (freshUser.role === "user") {
          const enrollRes = await api.get<Enrollment[]>("/enrollments/my").catch(() => null);
          if (enrollRes?.success && enrollRes.data) {
            setEnrollments(enrollRes.data);
            writeCache(ENROLLMENTS_KEY, enrollRes.data);
          }
        }

        if (!cachedUser) setLoading(false);
      })
      .catch(() => {
        writeCache(USER_KEY, null);
        writeCache(ENROLLMENTS_KEY, null);
        if (!cachedUser) setLoading(false);
        router.replace("/login");
      });
  }, [router]);

  async function logout() {
    await api.post("/auth/logout", {});
    writeCache(USER_KEY, null);
    writeCache(ENROLLMENTS_KEY, null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, enrollments, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
