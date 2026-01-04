import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Bluetooth, Wifi } from "lucide-react";

interface OnboardingPairingProps {
  onComplete: () => void;
}

interface Device {
  id: string;
  name: string;
  rssi: number;
}

export function OnboardingPairing({ onComplete }: OnboardingPairingProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  const startScan = () => {
    setIsScanning(true);
    setDevices([]);
    
    // Simulate device discovery
    setTimeout(() => {
      setDevices([
        { id: "1", name: "Xiao-ACQD-01", rssi: -48 },
      ]);
    }, 1500);

    setTimeout(() => {
      setDevices(prev => [...prev, { id: "2", name: "Xiao-ACQD-02", rssi: -62 }]);
    }, 2500);
  };

  const connectDevice = (device: Device) => {
    // Simulate connection
    setTimeout(onComplete, 800);
  };

  return (
    <div className="h-full flex flex-col p-6 pt-16 pb-12">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-3xl text-white tracking-tight">
          Pair Your Device
        </h1>
        <p className="text-[#A6A6A6] text-sm leading-relaxed px-4">
          Ensure your Xiao nRF52840 Sense is nearby and powered
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

      {/* Device List */}
      {devices.length > 0 && (
        <div className="mb-8 space-y-3">
          <p className="text-xs text-[#A6A6A6] uppercase tracking-wider px-2">
            Discovered Devices
          </p>
          {devices.map((device) => (
            <button
              key={device.id}
              onClick={() => connectDevice(device)}
              className="w-full bg-[#1C1C1E] rounded-[18px] p-4 flex items-center justify-between hover:bg-[#2C2C2E] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-[#00F0FF]" />
                </div>
                <div className="text-left">
                  <p className="text-white">{device.name}</p>
                  <p className="text-sm text-[#A6A6A6]">RSSI: {device.rssi} dB</p>
                </div>
              </div>
              <div className="text-[#00F0FF] text-sm">Connect</div>
            </button>
          ))}
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

      {/* Page indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]" />
      </div>
    </div>
  );
}
