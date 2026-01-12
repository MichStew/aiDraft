import { apiFetch, API_BASE_URL, isApiConfigured } from "./apiClient";

export interface AuthSettings {
  goalPuffs?: number;
  reductionPlan?: number;
  dailySpend?: number;
  minimalUseThreshold?: number;
  reductionPercent?: number;
  notificationsEnabled?: boolean;
  goalAlerts?: boolean;
  dailyCheckins?: boolean;
  dataSharing?: boolean;
  aiDataUse?: boolean;
  emailUpdates?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  settings?: AuthSettings;
  mfaEnabled?: boolean;
  hasPassword?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
  mfaCode?: string;
}

export async function getMe() {
  return apiFetch<AuthResponse>("/auth/me", { method: "GET" });
}

export async function login(credentials: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function register(credentials: AuthCredentials) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  return apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export function startGoogleOAuth() {
  if (!isApiConfigured()) return;
  const returnTo = window.location.origin;
  window.location.href = `${API_BASE_URL}/auth/google?returnTo=${encodeURIComponent(
    returnTo
  )}`;
}
