import { useState } from "react";
import { Button } from "../ui/button";
import { Bluetooth, ChevronLeft } from "lucide-react";
import { useBlePuffDevice } from "../../hooks/useBlePuffDevice";

interface OnboardingPairingProps {
  onComplete: () => void;
  onBack: () => void;
}

export function OnboardingPairing({ onComplete, onBack }: OnboardingPairingProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { connect, isSupported } = useBlePuffDevice();

  const startScan = async () => {
    setIsScanning(true);
    setErrorMessage(null);

    if (!isSupported) {
      setErrorMessage("Bluetooth pairing requires a compatible browser.");
      setIsScanning(false);
      return;
    }

    try {
      await connect();
      setIsScanning(false);
      setTimeout(onComplete, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to connect to the device.";
      setErrorMessage(message);
      setIsScanning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 pt-16 pb-12">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl text-white tracking-tight">
          Pair Your Device
        </h1>
        <p className="text-[#A6A6A6] text-sm leading-relaxed px-4">
          Ensure your Purifier device is nearby and powered
        </p>
      </div>

      {/* Pairing Animation */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-48 h-48">
          {isScanning ? (
            <>
              {/* Pulsing circle */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF3AF2]/10 to-[#00F0FF]/10 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-[#00F0FF]/10 flex items-center justify-center animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/20 flex items-center justify-center">
                    <Bluetooth className="w-10 h-10 text-[#00F0FF]" />
                  </div>
                </div>
              </div>
              
              {/* Scanning rings */}
              <div className="absolute inset-0 rounded-full border-2 border-[#FF3AF2]/35 animate-ping" />
              <div 
                className="absolute inset-0 rounded-full border-2 border-[#00F0FF]/25" 
                style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite", animationDelay: "0.5s" }}
              />
            </>
          ) : (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF3AF2]/10 to-[#00F0FF]/10 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[#00F0FF]/10 flex items-center justify-center">
                <Bluetooth className="w-16 h-16 text-[#00F0FF]/40" />
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-[16px] bg-[#2C1A1C] border border-[#FF5A6E]/40 p-3 text-xs text-[#FF9AA8]">
          {errorMessage}
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={startScan}
        disabled={isScanning}
        className="w-full h-14 bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[18px] shadow-[0_0_18px_rgba(0,240,255,0.35),0_0_24px_rgba(255,58,242,0.25)] hover:brightness-110 disabled:opacity-50"
      >
        {isScanning ? "Scanning..." : "Scan for Device"}
      </Button>

      {!isSupported && (
        <p className="text-[11px] text-[#A6A6A6] text-center mt-3">
          Bluetooth pairing requires a compatible browser.
        </p>
      )}

      {/* Page indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]" />
      </div>
    </div>
  );
}
