import { useState } from "react";
import { Mail, Lock, UserPlus } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError } from "../../services/apiClient";
import { startGoogleOAuth } from "../../services/auth";
import { isApiConfigured } from "../../services/apiClient";
import logo from "../../../aihdl_logo.png";

export function AuthScreen() {
  const { login, register, error, status } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiConfigured = isApiConfigured();

  const handleSubmit = async () => {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (!email.trim() || !password.trim()) {
        setLocalError("Email and password are required.");
        return;
      }
      if (mode === "login") {
        if (mfaRequired && !mfaCode.trim()) {
          setLocalError("Enter the 6-digit code from your authenticator app.");
          return;
        }
        await login({ email, password, mfaCode: mfaRequired ? mfaCode : undefined });
      } else {
        await register({ email, password, name });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const details = err.details as { error?: string; mfaRequired?: boolean };
        if (details?.error === "mfa_required" || details?.mfaRequired) {
          setMfaRequired(true);
          setLocalError("Enter the 6-digit code from your authenticator app.");
          return;
        }
        if (details?.error === "invalid mfa code") {
          setMfaRequired(true);
          setLocalError("Invalid authentication code. Try again.");
          return;
        }
      }
      setLocalError("Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] flex flex-col">
      <div className="h-12" />

      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <img src={logo} alt="App logo" className="h-8 w-auto object-contain" />
        <div>
          <h1 className="text-2xl text-white tracking-tight">Welcome back</h1>
          <p className="text-sm text-[#A6A6A6]">
            Sign in to sync your daily progress.
          </p>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col gap-5">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => {
                setMode("login");
                setMfaRequired(false);
                setMfaCode("");
                setLocalError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                mode === "login"
                  ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D]"
                  : "bg-[#2C2C2E] text-[#A6A6A6]"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMode("register");
                setMfaRequired(false);
                setMfaCode("");
                setLocalError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors ${
                mode === "register"
                  ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D]"
                  : "bg-[#2C2C2E] text-[#A6A6A6]"
              }`}
            >
              Create account
            </button>
          </div>

          {mode === "register" && (
            <label className="block mb-3">
              <span className="text-xs text-[#A6A6A6]">Name</span>
              <div className="mt-2 flex items-center gap-2 bg-[#0B0B0D] rounded-[12px] px-3 py-2">
                <UserPlus className="w-4 h-4 text-[#00F0FF]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4A4A4A] outline-none"
                />
              </div>
            </label>
          )}

          <label className="block mb-3">
            <span className="text-xs text-[#A6A6A6]">Email</span>
            <div className="mt-2 flex items-center gap-2 bg-[#0B0B0D] rounded-[12px] px-3 py-2">
              <Mail className="w-4 h-4 text-[#00F0FF]" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (mfaRequired) {
                    setMfaRequired(false);
                    setMfaCode("");
                  }
                }}
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4A4A4A] outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs text-[#A6A6A6]">Password</span>
            <div className="mt-2 flex items-center gap-2 bg-[#0B0B0D] rounded-[12px] px-3 py-2">
              <Lock className="w-4 h-4 text-[#00F0FF]" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (mfaRequired) {
                    setMfaRequired(false);
                    setMfaCode("");
                  }
                }}
                placeholder="8+ characters"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4A4A4A] outline-none"
              />
            </div>
          </label>

          {mode === "login" && mfaRequired && (
            <label className="block mt-3">
              <span className="text-xs text-[#A6A6A6]">Authenticator code</span>
              <div className="mt-2 flex items-center gap-2 bg-[#0B0B0D] rounded-[12px] px-3 py-2">
                <Lock className="w-4 h-4 text-[#00F0FF]" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4A4A4A] outline-none"
                />
              </div>
            </label>
          )}

          {(error || localError) && (
            <div className="mt-3 text-xs text-[#FF5A6E]">
              {localError ?? error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || status === "loading"}
            className="mt-4 w-full h-12 bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[16px] hover:brightness-110 disabled:opacity-60"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </div>

        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <p className="text-sm text-white mb-3">Or continue with</p>
          <button
            onClick={startGoogleOAuth}
            disabled={!apiConfigured}
            className="w-full bg-[#0B0B0D] text-white rounded-[14px] py-3 text-sm hover:bg-[#2C2C2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with Google
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <p className="text-xs text-[#A6A6A6] text-center">
          By continuing, you agree to keep your data in sync across devices.
        </p>
      </div>
    </div>
  );
}
