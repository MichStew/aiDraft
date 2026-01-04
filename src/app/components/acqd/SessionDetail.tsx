import { ChevronLeft, Download, Tag } from "lucide-react";
import { Button } from "../ui/button";

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

interface PuffEvent {
  id: string;
  time: string;
  confidence: number;
  duration: number;
  note?: string;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const puffEvents: PuffEvent[] = [
    { id: "1", time: "07:10:23 AM", confidence: 97, duration: 3.2 },
    { id: "2", time: "07:15:45 AM", confidence: 94, duration: 2.8 },
    { id: "3", time: "07:22:12 AM", confidence: 92, duration: 3.5, note: "After coffee" },
    { id: "4", time: "07:28:03 AM", confidence: 89, duration: 2.4 },
    { id: "5", time: "07:35:18 AM", confidence: 95, duration: 3.1 },
  ];

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />
      
      {/* Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl text-white tracking-tight">Session Detail</h1>
            <p className="text-sm text-[#A6A6A6]">07:10 AM — 07:40 AM</p>
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl text-white mb-1">5</p>
              <p className="text-xs text-[#A6A6A6]">Puffs</p>
            </div>
            <div>
              <p className="text-3xl text-[#00F0FF] mb-1">94%</p>
              <p className="text-xs text-[#A6A6A6]">Avg Confidence</p>
            </div>
            <div>
              <p className="text-3xl text-white mb-1">30m</p>
              <p className="text-xs text-[#A6A6A6]">Duration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 mb-6">
        <div className="flex gap-3">
          <button className="flex-1 bg-[#1C1C1E] rounded-[18px] py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#2C2C2E] transition-colors">
            <Download className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-white text-sm">Export</span>
          </button>
          <button className="flex-1 bg-[#1C1C1E] rounded-[18px] py-3 px-4 flex items-center justify-center gap-2 hover:bg-[#2C2C2E] transition-colors">
            <Tag className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-white text-sm">Tag Session</span>
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6">
        <h3 className="text-white mb-4">Timeline</h3>
        
        <div className="space-y-4 relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[#1C1C1E]" />
          
          {puffEvents.map((event, index) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Timeline dot */}
              <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]" />
                </div>
              </div>
              
              {/* Event card */}
              <div className="flex-1 bg-[#1C1C1E] rounded-[18px] p-4 hover:bg-[#2C2C2E] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white mb-1">Puff Event #{index + 1}</p>
                    <p className="text-sm text-[#A6A6A6]">{event.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00F0FF] mb-1">{event.confidence}%</p>
                    <p className="text-xs text-[#A6A6A6]">{event.duration}s</p>
                  </div>
                </div>
                
                {/* Confidence bar */}
                <div className="h-1.5 bg-[#00F0FF]/20 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] rounded-full transition-all"
                    style={{ width: `${event.confidence}%` }}
                  />
                </div>
                
                {event.note && (
                  <div className="mt-2 pt-2 border-t border-[#2C2C2E]">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-[#FFB84D]" />
                      <p className="text-xs text-[#FFB84D]">{event.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="px-6 mt-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <p className="text-xs text-[#A6A6A6] mb-2">Session Insights</p>
          <p className="text-sm text-white">
            This session had{" "}
            <span className="text-[#00F0FF]">25% fewer puffs</span> than your
            morning average. Great progress! 🎉
          </p>
        </div>
      </div>
    </div>
  );
}
