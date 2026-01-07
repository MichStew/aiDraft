import { useEffect, useRef, useState } from "react";
import { Home, TrendingUp, Sparkles, Target } from "lucide-react";
import { OnboardingWelcome } from "./components/acqd/OnboardingWelcome";
import { OnboardingPairing } from "./components/acqd/OnboardingPairing";
import { HomeDashboard } from "./components/acqd/HomeDashboard";
import { SessionDetail } from "./components/acqd/SessionDetail";
import { Analytics } from "./components/acqd/Analytics";
import { Goals } from "./components/acqd/Goals";
import { DeviceSettings } from "./components/acqd/DeviceSettings";
import { ExportPrivacy } from "./components/acqd/ExportPrivacy";
import { AICoaching } from "./components/acqd/AICoaching";

export type Screen = 
  | "onboarding-welcome"
  | "onboarding-pairing"
  | "home"
  | "session-detail"
  | "analytics"
  | "goals"
  | "settings"
  | "export"
  | "ai-coaching";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("onboarding-welcome");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [lastSeen, setLastSeen] = useState("just now");
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigateTo = (screen: Screen, sessionId?: string) => {
    if (sessionId) setSelectedSessionId(sessionId);
    setCurrentScreen(screen);
  };

  const markConnected = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus("connected");
    setLastSeen("just now");
  };

  const handleDisconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus("disconnected");
    setLastSeen("a moment ago");
  };

  const handleReconnect = () => {
    if (connectionStatus === "reconnecting") return;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setConnectionStatus("reconnecting");
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus("connected");
      setLastSeen("just now");
      reconnectTimeoutRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const isHomeActive = currentScreen === "home";
  const isAnalyticsActive = currentScreen === "analytics";
  const isCoachActive = currentScreen === "ai-coaching";
  const isGoalsActive = currentScreen === "goals";
  const showNav = !["onboarding-welcome", "onboarding-pairing"].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] flex items-center justify-center p-4">
      {/* iPhone 14 Pro Frame */}
      <div className="w-[393px] h-[852px] bg-[#0B0B0D] bg-gradient-to-br from-[#14081C] via-[#0B0B0D] to-[#06131C] rounded-[60px] border-[14px] border-[#1C1C1E] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-b-[20px] z-50" />
        
        {/* Screen Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {currentScreen === "onboarding-welcome" && (
            <OnboardingWelcome onNext={() => navigateTo("onboarding-pairing")} />
          )}
          {currentScreen === "onboarding-pairing" && (
            <OnboardingPairing onComplete={() => {
              markConnected();
              navigateTo("home");
            }} />
          )}
          {currentScreen === "home" && (
            <HomeDashboard 
              onNavigate={navigateTo}
              onSessionSelect={(id) => navigateTo("session-detail", id)}
              connectionStatus={connectionStatus}
              lastSeen={lastSeen}
              onReconnect={handleReconnect}
            />
          )}
          {currentScreen === "session-detail" && (
            <SessionDetail 
              sessionId={selectedSessionId || ""}
              onBack={() => navigateTo("home")}
            />
          )}
          {currentScreen === "analytics" && (
            <Analytics onBack={() => navigateTo("home")} />
          )}
          {currentScreen === "goals" && (
            <Goals onBack={() => navigateTo("home")} />
          )}
          {currentScreen === "settings" && (
            <DeviceSettings
              onBack={() => navigateTo("home")}
              connectionStatus={connectionStatus}
              lastSeen={lastSeen}
              onDisconnect={handleDisconnect}
              onReconnect={handleReconnect}
            />
          )}
          {currentScreen === "export" && (
            <ExportPrivacy onBack={() => navigateTo("home")} />
          )}
          {currentScreen === "ai-coaching" && (
            <AICoaching onBack={() => navigateTo("home")} />
          )}
        </div>

        {/* Bottom Navigation */}
        {showNav && (
          <div className="bg-[#0B0B0D]/90 bg-gradient-to-r from-[#170A22]/70 via-[#0B0B0D]/90 to-[#06141C]/70 backdrop-blur-lg border-t border-[#1C1C1E]">
            <div className="px-6 py-3 flex justify-around">
              <button
                onClick={() => navigateTo("home")}
                className={`flex flex-col items-center gap-1 ${
                  isHomeActive ? "text-[#00F0FF]" : "text-[#A6A6A6]"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isHomeActive ? "bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10" : "bg-[#1C1C1E]"
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs">Home</span>
              </button>
              <button
                onClick={() => navigateTo("analytics")}
                className={`flex flex-col items-center gap-1 ${
                  isAnalyticsActive ? "text-[#00F0FF]" : "text-[#A6A6A6]"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isAnalyticsActive ? "bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10" : "bg-[#1C1C1E]"
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="text-xs">Analytics</span>
              </button>
              <button
                onClick={() => navigateTo("ai-coaching")}
                className={`flex flex-col items-center gap-1 ${
                  isCoachActive ? "text-[#FF3AF2]" : "text-[#A6A6A6]"
                }`}
              >
                <div className="relative">
                  {isCoachActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF3AF2]/30 to-[#00F0FF]/30 blur-md opacity-70" />
                  )}
                  <div
                    className={`relative h-11 w-11 rounded-full border flex items-center justify-center ${
                      isCoachActive
                        ? "border-[#00F0FF]/50 bg-[#0B0B0D] shadow-[0_0_18px_rgba(0,240,255,0.45),0_0_30px_rgba(255,58,242,0.3)]"
                        : "border-[#2A2A2C] bg-[#0B0B0D]"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full border flex items-center justify-center ${
                        isCoachActive ? "border-[#00F0FF]" : "border-[#3A3A3C]"
                      }`}
                    >
                      <Sparkles
                        className={`w-3.5 h-3.5 ${
                          isCoachActive ? "text-[#00F0FF]" : "text-[#6B6B6B]"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-xs">Coach</span>
              </button>
              <button
                onClick={() => navigateTo("goals")}
                className={`flex flex-col items-center gap-1 ${
                  isGoalsActive ? "text-[#00F0FF]" : "text-[#A6A6A6]"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    isGoalsActive ? "bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10" : "bg-[#1C1C1E]"
                  }`}
                >
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-xs">Goals</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
