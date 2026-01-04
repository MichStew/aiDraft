import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Plus, X } from "lucide-react";

export interface Incident {
  id: string;
  date: Date;
  note: string;
}

interface TrackingProps {
  incidents: Incident[];
  onAddIncident: (note: string) => void;
  onDeleteIncident: (id: string) => void;
}

export function Tracking({ incidents, onAddIncident, onDeleteIncident }: TrackingProps) {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (note.trim()) {
      onAddIncident(note.trim());
      setNote("");
      setShowForm(false);
    } else {
      onAddIncident("Vaping incident");
      setShowForm(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const todayIncidents = incidents.filter((incident) => {
    const today = new Date();
    return incident.date.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white">Track Incidents</h2>
          <p className="text-sm text-zinc-500">Today: {todayIncidents} incidents</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          variant="outline"
          className="border-zinc-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Log
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="space-y-3">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about what triggered this incident... (optional)"
              className="bg-zinc-800 border-zinc-700 text-white"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-orange-600 hover:bg-orange-700 flex-1"
              >
                Log Incident
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setNote("");
                }}
                variant="outline"
                className="border-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {incidents.length === 0 ? (
          <Card className="p-6 bg-zinc-900 border-zinc-800 text-center">
            <p className="text-zinc-400">No incidents logged yet. Stay strong! 💪</p>
          </Card>
        ) : (
          incidents.map((incident) => (
            <Card
              key={incident.id}
              className="p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-orange-500 bg-orange-950/50 px-2 py-0.5 rounded">
                      Incident
                    </span>
                    <span className="text-xs text-zinc-500">{formatDate(incident.date)}</span>
                  </div>
                  {incident.note && (
                    <p className="text-sm text-zinc-300">{incident.note}</p>
                  )}
                </div>
                <button
                  onClick={() => onDeleteIncident(incident.id)}
                  className="text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {incidents.length > 0 && (
        <Card className="p-4 bg-blue-950/20 border-blue-900/30">
          <p className="text-sm text-blue-400">
            💡 Tip: Review your incidents to identify patterns and triggers. This helps you avoid them in the future.
          </p>
        </Card>
      )}
    </div>
  );
}
