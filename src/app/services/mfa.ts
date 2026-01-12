import { apiFetch } from "./apiClient";

export interface MfaSetupResponse {
  secret: string;
  otpauthUrl: string;
  issuer: string;
  accountName: string;
}

export async function fetchMfaStatus() {
  return apiFetch<{ enabled: boolean }>("/mfa/status", { method: "GET" });
}

export async function setupMfa() {
  return apiFetch<MfaSetupResponse>("/mfa/setup", { method: "POST" });
}

export async function enableMfa(code: string) {
  return apiFetch<{ enabled: boolean }>("/mfa/enable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function disableMfa(code: string, password?: string) {
  return apiFetch<{ enabled: boolean }>("/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ code, password }),
  });
}
