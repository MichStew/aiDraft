import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthCredentials,
  AuthResponse,
  AuthUser,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/auth";
import { ApiError, isApiConfigured } from "../services/apiClient";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<AuthResponse>;
  register: (credentials: AuthCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (next: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isApiConfigured()) {
      setStatus("unauthenticated");
      setUser(null);
      setError("API is not configured.");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const response = await getMe();
      setUser(response.user);
      setStatus("authenticated");
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
      if (err instanceof ApiError) {
        if (err.status !== 401) {
          setError("Unable to reach the server.");
        }
      } else {
        setError("Unable to reach the server.");
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setError(null);
    const response = await loginRequest(credentials);
    setUser(response.user);
    setStatus("authenticated");
    return response;
  }, []);

  const register = useCallback(async (credentials: AuthCredentials) => {
    setError(null);
    const response = await registerRequest(credentials);
    setUser(response.user);
    setStatus("authenticated");
    return response;
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    await logoutRequest();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateUser = useCallback((next: AuthUser) => {
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      refresh,
      updateUser,
    }),
    [user, status, error, login, register, logout, refresh, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
