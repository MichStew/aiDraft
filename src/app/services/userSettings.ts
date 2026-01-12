import { apiFetch } from "./apiClient";
import { AuthResponse, AuthSettings } from "./auth";

export async function updateUserSettings(settings: AuthSettings) {
  return apiFetch<AuthResponse>("/user/settings", {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
}
