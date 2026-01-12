import { useCallback, useState } from "react";
import { AuthSettings } from "../services/auth";
import { updateUserSettings } from "../services/userSettings";
import { useAuth } from "./useAuth";

export function useUserSettings() {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = user?.settings ?? {};

  const saveSettings = useCallback(
    async (updates: AuthSettings) => {
      if (!user) {
        setError("Not signed in.");
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const response = await updateUserSettings(updates);
        updateUser(response.user);
      } catch (err) {
        setError("Unable to save settings");
      } finally {
        setIsSaving(false);
      }
    },
    [updateUser, user]
  );

  return {
    settings,
    saveSettings,
    isSaving,
    error,
  };
}
