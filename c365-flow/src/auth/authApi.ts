import { API_BASE } from "../api/client";

export async function login(email: string, password: string): Promise<string> {
  const r = await fetch(`${API_BASE}/Authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Username: email, Password: password }),
  });

  if (!r.ok) {
    throw new Error("Invalid credentials");
  }

  const { token } = await r.json();
  return token as string;
}
