import { cookies } from "next/headers";
import type { ApiResponse } from "./api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function getServerApi() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const cookieHeader = token ? `token=${token}` : "";

  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(cookieHeader && { Cookie: cookieHeader }),
  };

  async function get<T>(path: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      headers: baseHeaders,
      cache: "no-store",
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async function post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  async function patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    const res = await fetch(`${API_URL}/api/v1${path}`, {
      method: "PATCH",
      headers: baseHeaders,
      body: JSON.stringify(body),
      cache: "no-store",
    });
    return res.json() as Promise<ApiResponse<T>>;
  }

  return { get, post, patch };
}
