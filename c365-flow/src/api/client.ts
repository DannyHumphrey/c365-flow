import { authFetch } from "../auth/AuthContext";

export const API_BASE =
  process.env.EXPO_PUBLIC_FORMS_API_BASE || "http://localhost:3000";

export async function apiFetch<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<{ data: T; etag?: string }> {
  const res = await authFetch(`${API_BASE}${path}`, init);
  const etag = res.headers.get("ETag") || undefined;
  const data = (await res.json()) as T;
  return { data, etag };
}
