import { ChevronLeft, Download, Tag } from "lucide-react";
import { useDailyLogByDate } from "../../hooks/useDailyLogByDate";

interface SessionDetailProps {
  sessionId: string;
  onBack: () => void;
}

export function SessionDetail({ sessionId, onBack }: SessionDetailProps) {
  const { log, isLoading, error } = useDailyLogByDate(sessionId);
  const dateLabel = sessionId
    ? new Date(`${sessionId}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "Daily Log";
  const puffCount = log?.metrics?.puffCount;
  const goalPuffs = log?.metrics?.goalPuffs;
  const hasGoal = typeof goalPuffs === "number" && goalPuffs > 0;
  const hasPuffs = typeof puffCount === "number";
  const goalMet = hasGoal && hasPuffs ? puffCount <= goalPuffs : false;
  const insightText = !log
    ? "No log data for this day yet."
    : !hasGoal
      ? "No daily goal was set for this log."
      : goalMet
        ? "You stayed within your goal today. Keep the momentum going."
        : "Today exceeded the goal. Review triggers and try a reset tomorrow.";

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
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
            <h1 className="text-2xl text-white tracking-tight">Daily Log</h1>
            <p className="text-sm text-[#A6A6A6]">{dateLabel}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          {isLoading && (
            <p className="text-sm text-[#A6A6A6]">Loading log data...</p>
          )}
          {!isLoading && !log && (
            <p className="text-sm text-[#A6A6A6]">No log saved for this day.</p>
          )}
          {!isLoading && log && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl text-white mb-1">
                  {hasPuffs ? puffCount : "--"}
                </p>
                <p className="text-xs text-[#A6A6A6]">Puffs</p>
              </div>
              <div>
                <p className="text-3xl text-[#00F0FF] mb-1">
                  {hasGoal ? goalPuffs : "--"}
                </p>
                <p className="text-xs text-[#A6A6A6]">Daily Goal</p>
              </div>
              <div>
                <p
                  className={`text-3xl mb-1 ${
                    goalMet ? "text-[#00F0FF]" : "text-white"
                  }`}
                >
                  {hasGoal ? (goalMet ? "Met" : "Over") : "N/A"}
                </p>
                <p className="text-xs text-[#A6A6A6]">Goal Status</p>
              </div>
            </div>
          )}
          {error && (
            <p className="text-xs text-[#FF5A6E] mt-3">
              {error}. Try again later.
            </p>
          )}
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
            <span className="text-white text-sm">Tag Day</span>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="px-6">
        <h3 className="text-white mb-4">Notes</h3>
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          {log?.notes ? (
            <p className="text-sm text-white">{log.notes}</p>
          ) : (
            <p className="text-sm text-[#A6A6A6]">
              No notes saved for this day.
            </p>
          )}
        </div>
      </div>

      {/* Daily Insight */}
      <div className="px-6 mt-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <p className="text-xs text-[#A6A6A6] mb-2">Daily Insight</p>
          <p className="text-sm text-white">{insightText}</p>
        </div>
      </div>
    </div>
  );
}
