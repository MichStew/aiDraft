import { Button } from "../ui/button";
import { Waves, Shield, Zap } from "lucide-react";
import logo from "../../../aihdl_logo.png";

interface OnboardingWelcomeProps {
  onNext: () => void;
}

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="h-full flex flex-col items-center justify-between p-6 pt-16 pb-12">
      {/* Hero Illustration */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          {/* Device illustration */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/15 flex items-center justify-center relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF3AF2]/15 to-[#00F0FF]/10 flex items-center justify-center">
              <div className="w-24 h-24 flex items-center justify-center">
                <img src={logo} alt="App logo" className="w-20 h-20 object-contain" />
              </div>
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-2 border-[#FF3AF2]/25 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-[#00F0FF]/15" style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite", animationDelay: "1s" }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 w-full">
        <div className="text-center space-y-3">
          <h1 className="text-4xl text-white tracking-tight">
            Meet AI-CQD
          </h1>
          <p className="text-[#A6A6A6] text-base leading-relaxed">
            Your intelligent companion for real-time awareness and healthier habits
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Privacy-first</p>
              <p className="text-sm text-[#A6A6A6]">All processing on your device</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Edge AI</p>
              <p className="text-sm text-[#A6A6A6]">Advanced ML detection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
              <Waves className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Real-time feedback</p>
              <p className="text-sm text-[#A6A6A6]">Instant insights as they happen</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onNext}
          className="w-full h-14 bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[18px] shadow-[0_0_18px_rgba(0,240,255,0.35),0_0_24px_rgba(255,58,242,0.25)] hover:brightness-110"
        >
          Continue
        </Button>

        {/* Page indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
