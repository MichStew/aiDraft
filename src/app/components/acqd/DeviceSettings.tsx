import { useState } from "react";
import { ChevronLeft, Battery, Wifi, Download, Sliders, LogOut, User } from "lucide-react";
import { ConnectionStatus } from "../../App";
import { useAuth } from "../../hooks/useAuth";

interface DeviceSettingsProps {
  onBack: () => void;
  connectionStatus: ConnectionStatus;
  lastSeen: string;
  onDisconnect: () => void;
  onReconnect: () => void;
}

export function DeviceSettings({
  onBack,
  connectionStatus,
  lastSeen,
  onDisconnect,
  onReconnect
}: DeviceSettingsProps) {
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("medium");
  const [showForgetModal, setShowForgetModal] = useState(false);
  const { user, logout } = useAuth();

  const batteryHistory = [92, 88, 85, 82, 80, 78, 75, 73];
  const isConnected = connectionStatus === "connected";
  const isReconnecting = connectionStatus === "reconnecting";
  const statusLabel = isConnected ? "Connected" : isReconnecting ? "Reconnecting..." : "Disconnected";
  const statusDotClass = isConnected
    ? "bg-[#00F0FF] animate-pulse"
    : isReconnecting
      ? "bg-[#F5C542] animate-pulse"
      : "bg-[#FF5A6E]";
  const statusTextClass = isConnected
    ? "text-[#00F0FF]"
    : isReconnecting
      ? "text-[#F5C542]"
      : "text-[#FF5A6E]";
  const lastSeenLabel = isConnected ? "Live" : isReconnecting ? "Trying now" : lastSeen;

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />
      
      {/* Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl text-white tracking-tight">Device Settings</h1>
        </div>
      </div>

      {/* Device Info */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF3AF2] to-[#00F0FF] flex items-center justify-center">
              <Wifi className="w-8 h-8 text-[#0B0B0D]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white mb-1">Purifier-ACQD-01</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
                <span className={`text-sm ${statusTextClass}`}>{statusLabel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#A6A6A6] text-sm">Firmware Version</span>
              <span className="text-white text-sm">v1.02</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A6A6A6] text-sm">Last Seen</span>
              <span className="text-white text-sm">{lastSeenLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#A6A6A6] text-sm">Serial Number</span>
              <span className="text-white text-sm">NRF-A01-2024</span>
            </div>
          </div>

          <div className="mt-4">
            {isConnected && (
              <button
                onClick={onDisconnect}
                className="w-full bg-[#2C2C2E] text-white rounded-[14px] py-2 text-sm hover:bg-[#3A3A3C] transition-colors"
              >
                Disconnect
              </button>
            )}
            {connectionStatus === "disconnected" && (
              <button
                onClick={onReconnect}
                className="w-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[14px] py-2 text-sm hover:brightness-110 transition-colors"
              >
                Reconnect
              </button>
            )}
            {isReconnecting && (
              <button
                disabled
                className="w-full bg-[#2C2C2E] text-[#A6A6A6] rounded-[14px] py-2 text-sm"
              >
                Reconnecting...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Signed in</p>
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

      {/* Battery Graph */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Battery className="w-5 h-5 text-[#00F0FF]" />
              <h3 className="text-white">Battery</h3>
            </div>
            <span className="text-2xl text-white">82%</span>
          </div>

          {/* Battery history chart */}
          <div className="h-24 flex items-end justify-between gap-2">
            {batteryHistory.map((value, i) => {
              const height = value;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#FF3AF2] to-[#00F0FF] transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-[#A6A6A6] mt-2">
            <span>7d ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      {/* Sensitivity Tuning */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Detection Sensitivity</h3>
          </div>

          <div className="space-y-3">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSensitivity(level)}
                className={`w-full p-4 rounded-[14px] text-left transition-all ${
                  sensitivity === level
                    ? "bg-gradient-to-br from-[#FF3AF2]/15 to-[#00F0FF]/10 border-2 border-[#00F0FF]"
                    : "bg-[#2C2C2E] border-2 border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white capitalize mb-1">{level}</p>
                    <p className="text-xs text-[#A6A6A6]">
                      {level === "low" && "Fewer false positives"}
                      {level === "medium" && "Balanced detection"}
                      {level === "high" && "Maximum sensitivity"}
                    </p>
                  </div>
                  {sensitivity === level && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#0B0B0D] rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BLE Log Download */}
      <div className="px-6 mb-6">
        <button className="w-full bg-[#1C1C1E] rounded-[18px] p-4 flex items-center justify-between hover:bg-[#2C2C2E] transition-colors">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-[#00F0FF]" />
            <div className="text-left">
              <p className="text-white">Download BLE Logs</p>
              <p className="text-sm text-[#A6A6A6]">Export connection logs</p>
            </div>
          </div>
        </button>
      </div>

      {/* Forget Device */}
      <div className="px-6">
        <button 
          onClick={() => setShowForgetModal(true)}
          className="w-full bg-[#FF5A6E]/10 border border-[#FF5A6E]/30 rounded-[18px] p-4 text-[#FF5A6E] hover:bg-[#FF5A6E]/20 transition-colors"
        >
          Forget Device
        </button>
      </div>

      {/* Forget Device Modal */}
      {showForgetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full">
            <h3 className="text-xl text-white mb-3">Forget Device?</h3>
            <p className="text-[#A6A6A6] text-sm mb-6">
              This will remove Purifier-ACQD-01 from your connected devices. You'll need to pair it again to use it.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForgetModal(false)}
                className="flex-1 bg-[#2C2C2E] text-white rounded-[14px] py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowForgetModal(false);
                  setTimeout(onBack, 300);
                }}
                className="flex-1 bg-[#FF5A6E] text-white rounded-[14px] py-3"
              >
                Forget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
