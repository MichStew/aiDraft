import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
  ShieldCheck,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { Switch } from "../ui/switch";
import { useAuth } from "../../hooks/useAuth";
import { useUserSettings } from "../../hooks/useUserSettings";
import { disableMfa, enableMfa, setupMfa } from "../../services/mfa";

interface SettingsProps {
  onBack: () => void;
  onOpenDevice: () => void;
  onOpenExport: () => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-white">{label}</p>
        <p className="text-xs text-[#A6A6A6] mt-1">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function Settings({ onBack, onOpenDevice, onOpenExport }: SettingsProps) {
  const { user, logout, refresh } = useAuth();
  const { settings, saveSettings, isSaving, error } = useUserSettings();
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [goalAlerts, setGoalAlerts] = useState<boolean | null>(null);
  const [dailyCheckins, setDailyCheckins] = useState<boolean | null>(null);
  const [dataSharing, setDataSharing] = useState<boolean | null>(null);
  const [aiDataUse, setAiDataUse] = useState<boolean | null>(null);
  const [emailUpdates, setEmailUpdates] = useState<boolean | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaUrl, setMfaUrl] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isMfaBusy, setIsMfaBusy] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const initialSync = useRef(true);
  const mfaEnabled = Boolean(user?.mfaEnabled);
  const hasPassword = Boolean(user?.hasPassword);

  useEffect(() => {
    if (typeof settings.notificationsEnabled === "boolean") {
      setNotificationsEnabled(settings.notificationsEnabled);
    }
    if (typeof settings.goalAlerts === "boolean") {
      setGoalAlerts(settings.goalAlerts);
    }
    if (typeof settings.dailyCheckins === "boolean") {
      setDailyCheckins(settings.dailyCheckins);
    }
    if (typeof settings.dataSharing === "boolean") {
      setDataSharing(settings.dataSharing);
    }
    if (typeof settings.aiDataUse === "boolean") {
      setAiDataUse(settings.aiDataUse);
    }
    if (typeof settings.emailUpdates === "boolean") {
      setEmailUpdates(settings.emailUpdates);
    }
  }, [
    settings.notificationsEnabled,
    settings.goalAlerts,
    settings.dailyCheckins,
    settings.dataSharing,
    settings.aiDataUse,
    settings.emailUpdates,
  ]);

  const isReady =
    notificationsEnabled !== null &&
    goalAlerts !== null &&
    dailyCheckins !== null &&
    dataSharing !== null &&
    aiDataUse !== null &&
    emailUpdates !== null;

  useEffect(() => {
    if (!user || !isReady) return undefined;
    if (initialSync.current) {
      initialSync.current = false;
      return undefined;
    }

    const resolvedNotifications = notificationsEnabled as boolean;
    const resolvedGoalAlerts = goalAlerts as boolean;
    const resolvedDailyCheckins = dailyCheckins as boolean;
    const resolvedDataSharing = dataSharing as boolean;
    const resolvedAiDataUse = aiDataUse as boolean;
    const resolvedEmailUpdates = emailUpdates as boolean;

    const currentSettings = {
      notificationsEnabled: settings.notificationsEnabled,
      goalAlerts: settings.goalAlerts,
      dailyCheckins: settings.dailyCheckins,
      dataSharing: settings.dataSharing,
      aiDataUse: settings.aiDataUse,
      emailUpdates: settings.emailUpdates,
    };

    if (
      currentSettings.notificationsEnabled === resolvedNotifications &&
      currentSettings.goalAlerts === resolvedGoalAlerts &&
      currentSettings.dailyCheckins === resolvedDailyCheckins &&
      currentSettings.dataSharing === resolvedDataSharing &&
      currentSettings.aiDataUse === resolvedAiDataUse &&
      currentSettings.emailUpdates === resolvedEmailUpdates
    ) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      saveSettings({
        notificationsEnabled: resolvedNotifications,
        goalAlerts: resolvedGoalAlerts,
        dailyCheckins: resolvedDailyCheckins,
        dataSharing: resolvedDataSharing,
        aiDataUse: resolvedAiDataUse,
        emailUpdates: resolvedEmailUpdates,
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, [
    user,
    isReady,
    notificationsEnabled,
    goalAlerts,
    dailyCheckins,
    dataSharing,
    aiDataUse,
    emailUpdates,
    saveSettings,
    settings.notificationsEnabled,
    settings.goalAlerts,
    settings.dailyCheckins,
    settings.dataSharing,
    settings.aiDataUse,
    settings.emailUpdates,
  ]);

  const resetMfaState = () => {
    setMfaSecret(null);
    setMfaUrl(null);
    setMfaCode("");
    setMfaPassword("");
    setMfaError(null);
    setIsMfaBusy(false);
  };

  const handleStartMfaSetup = async () => {
    setMfaError(null);
    setIsMfaBusy(true);
    try {
      const response = await setupMfa();
      setMfaSecret(response.secret);
      setMfaUrl(response.otpauthUrl);
      setShowMfaSetup(true);
    } catch (err) {
      setMfaError("Unable to start MFA setup.");
    } finally {
      setIsMfaBusy(false);
    }
  };

  const handleEnableMfa = async () => {
    if (!mfaCode.trim()) {
      setMfaError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setIsMfaBusy(true);
    setMfaError(null);
    try {
      await enableMfa(mfaCode);
      await refresh();
      setShowMfaSetup(false);
      resetMfaState();
    } catch (err) {
      setMfaError("Invalid code. Please try again.");
    } finally {
      setIsMfaBusy(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaCode.trim()) {
      setMfaError("Enter the 6-digit code to disable MFA.");
      return;
    }
    if (hasPassword && !mfaPassword.trim()) {
      setMfaError("Password is required to disable MFA.");
      return;
    }
    setIsMfaBusy(true);
    setMfaError(null);
    try {
      await disableMfa(mfaCode, hasPassword ? mfaPassword : undefined);
      await refresh();
      setShowMfaDisable(false);
      resetMfaState();
    } catch (err) {
      setMfaError("Unable to disable MFA. Check your code and password.");
    } finally {
      setIsMfaBusy(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      <div className="h-12" />

      <div className="px-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl text-white tracking-tight">Settings</h1>
            <p className="text-xs text-[#A6A6A6]">
              {isSaving ? "Saving changes..." : "Manage your preferences"}
            </p>
          </div>
        </div>
      </div>

      {!isReady && (
        <div className="px-6 mb-6">
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-sm text-[#A6A6A6]">
            Loading your settings...
          </div>
        </div>
      )}

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Account</p>
              <p className="text-sm text-[#A6A6A6]">{user?.email ?? "Unknown"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full bg-[#2C2C2E] text-white rounded-[14px] py-2 text-sm hover:bg-[#3A3A3C] transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Security</h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white">Multi-factor authentication</p>
              <p className="text-xs text-[#A6A6A6] mt-1">
                {mfaEnabled ? "Enabled" : "Not enabled"} · Protect your account with a 6-digit code.
              </p>
            </div>
            <button
              onClick={() => {
                resetMfaState();
                if (mfaEnabled) {
                  setShowMfaDisable(true);
                } else {
                  handleStartMfaSetup();
                }
              }}
              disabled={isMfaBusy}
              className="text-xs text-[#0B0B0D] bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] px-3 py-2 rounded-full disabled:opacity-60"
            >
              {mfaEnabled ? "Disable" : "Set up MFA"}
            </button>
          </div>
          {mfaError && (
            <p className="text-xs text-[#FF5A6E] mt-3">{mfaError}</p>
          )}
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Notifications</h3>
          </div>
          <ToggleRow
            label="App notifications"
            description="Allow reminders and progress nudges."
            checked={Boolean(notificationsEnabled)}
            disabled={!isReady}
            onCheckedChange={setNotificationsEnabled}
          />
          <ToggleRow
            label="Goal alerts"
            description="Get alerts when you are near your daily goal."
            checked={Boolean(goalAlerts)}
            disabled={!isReady}
            onCheckedChange={setGoalAlerts}
          />
          <ToggleRow
            label="Daily check-ins"
            description="Receive a short daily check-in prompt."
            checked={Boolean(dailyCheckins)}
            disabled={!isReady}
            onCheckedChange={setDailyCheckins}
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Privacy & data</h3>
          </div>
          <ToggleRow
            label="Share anonymized usage"
            description="Help improve the app by sharing anonymous trends."
            checked={Boolean(dataSharing)}
            disabled={!isReady}
            onCheckedChange={setDataSharing}
          />
          <ToggleRow
            label="coach personalization"
            description="Allow coach to use your logs for better tips."
            checked={Boolean(aiDataUse)}
            disabled={!isReady}
            onCheckedChange={setAiDataUse}
          />
          <ToggleRow
            label="Email updates"
            description="Product updates and progress summaries."
            checked={Boolean(emailUpdates)}
            disabled={!isReady}
            onCheckedChange={setEmailUpdates}
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Data & device</h3>
          </div>
          <button
            onClick={onOpenDevice}
            className="w-full flex items-center justify-between py-3 border-b border-[#2C2C2E] text-left"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-[#A6A6A6]" />
              <div>
                <p className="text-sm text-white">Device settings</p>
                <p className="text-xs text-[#A6A6A6]">Manage device pairing and logs.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A6A6A6]" />
          </button>
          <button
            onClick={onOpenExport}
            className="w-full flex items-center justify-between py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-[#A6A6A6]" />
              <div>
                <p className="text-sm text-white">Export & privacy</p>
                <p className="text-xs text-[#A6A6A6]">Download your data archive.</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A6A6A6]" />
          </button>
        </div>
      </div>

      {showMfaSetup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full">
            <h3 className="text-xl text-white mb-3">Set up MFA</h3>
            <p className="text-sm text-[#A6A6A6] mb-4">
              Add this account to your authenticator app using the secret below.
            </p>
            <div className="bg-[#0B0B0D] rounded-[12px] p-3 mb-3">
              <p className="text-xs text-[#A6A6A6] mb-1">Secret</p>
              <p className="text-sm text-white break-all">{mfaSecret ?? "--"}</p>
            </div>
            {mfaUrl && (
              <p className="text-[10px] text-[#6B6B6B] break-all mb-3">
                {mfaUrl}
              </p>
            )}
            <label className="block mb-4">
              <span className="text-xs text-[#A6A6A6]">6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value)}
                placeholder="123456"
                className="mt-2 w-full rounded-[12px] bg-[#0B0B0D] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            {mfaError && (
              <p className="text-xs text-[#FF5A6E] mb-3">{mfaError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMfaSetup(false);
                  resetMfaState();
                }}
                className="flex-1 bg-[#2C2C2E] text-white rounded-[14px] py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleEnableMfa}
                disabled={isMfaBusy}
                className="flex-1 bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[14px] py-3 disabled:opacity-50"
              >
                {isMfaBusy ? "Enabling..." : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMfaDisable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full">
            <h3 className="text-xl text-white mb-3">Disable MFA</h3>
            <p className="text-sm text-[#A6A6A6] mb-4">
              Enter your authenticator code to confirm.
            </p>
            <label className="block mb-3">
              <span className="text-xs text-[#A6A6A6]">6-digit code</span>
              <input
                type="text"
                inputMode="numeric"
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value)}
                placeholder="123456"
                className="mt-2 w-full rounded-[12px] bg-[#0B0B0D] px-3 py-2 text-sm text-white outline-none"
              />
            </label>
            {hasPassword && (
              <label className="block mb-3">
                <span className="text-xs text-[#A6A6A6]">Password</span>
                <input
                  type="password"
                  value={mfaPassword}
                  onChange={(event) => setMfaPassword(event.target.value)}
                  placeholder="Your password"
                  className="mt-2 w-full rounded-[12px] bg-[#0B0B0D] px-3 py-2 text-sm text-white outline-none"
                />
              </label>
            )}
            {mfaError && (
              <p className="text-xs text-[#FF5A6E] mb-3">{mfaError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMfaDisable(false);
                  resetMfaState();
                }}
                className="flex-1 bg-[#2C2C2E] text-white rounded-[14px] py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableMfa}
                disabled={isMfaBusy}
                className="flex-1 bg-[#FF5A6E] text-white rounded-[14px] py-3 disabled:opacity-50"
              >
                {isMfaBusy ? "Disabling..." : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="px-6">
          <div className="bg-[#FF5A6E]/10 border border-[#FF5A6E]/30 rounded-[18px] p-4 text-xs text-[#FF5A6E]">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
