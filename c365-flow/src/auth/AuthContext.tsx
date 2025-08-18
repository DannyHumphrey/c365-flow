import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";

import { login as loginApi } from "./authApi";
import { saveToken, getToken, deleteToken } from "./secureStore";
import { getFormTemplatesCached } from "../offline/templatesCache";

interface JwtPayload {
  exp: number;
  roles?: string[];
  [key: string]: any;
}

interface AuthContextType {
  token: string | null;
  roles: string[];
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let currentToken: string | null = null;

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (currentToken) {
    headers.set("Authorization", `Bearer ${currentToken}`);
  }
  return fetch(input, { ...init, headers });
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const payload = jwtDecode<JwtPayload>(stored);
          if (payload.exp * 1000 > Date.now()) {
            setToken(stored);
            currentToken = stored;
            setRoles(payload.roles || []);
          } else {
            await deleteToken();
          }
        } catch {
          await deleteToken();
        }
      }
      setReady(true);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const t = await loginApi(email, password);
    await saveToken(t);
    const payload = jwt_decode<JwtPayload>(t);
    setToken(t);
    currentToken = t;
    setRoles(payload.roles || []);
    await getFormTemplatesCached(true);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    currentToken = null;
    setRoles([]);
    await deleteToken();
  }, []);

  const value: AuthContextType = {
    token,
    roles,
    isReady,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
}
