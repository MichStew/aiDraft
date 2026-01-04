import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar, DollarSign } from "lucide-react";

interface SetupProps {
  onComplete: (quitDate: Date, costPerPod: number, podsPerWeek: number) => void;
}

export function Setup({ onComplete }: SetupProps) {
  const [quitDate, setQuitDate] = useState("");
  const [costPerPod, setCostPerPod] = useState("25");
  const [podsPerWeek, setPodsPerWeek] = useState("2");

  const handleSubmit = () => {
    if (quitDate) {
      onComplete(
        new Date(quitDate),
        parseFloat(costPerPod) || 25,
        parseFloat(podsPerWeek) || 2
      );
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-zinc-900 border-zinc-800">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-2xl mb-2">Welcome to VapeFree</h1>
          <p className="text-zinc-400">Let's set up your journey to a healthier you</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-white">When did you quit vaping?</Label>
            <Input
              type="date"
              value={quitDate}
              onChange={(e) => setQuitDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="bg-zinc-800 border-zinc-700 text-white [color-scheme:dark]"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Or select today if you're starting now
            </p>
          </div>

          <div>
            <Label className="text-white">Cost per pod/cartridge ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="number"
                value={costPerPod}
                onChange={(e) => setCostPerPod(e.target.value)}
                placeholder="25"
                className="bg-zinc-800 border-zinc-700 text-white pl-9"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Pods per week (before quitting)</Label>
            <Input
              type="number"
              value={podsPerWeek}
              onChange={(e) => setPodsPerWeek(e.target.value)}
              placeholder="2"
              className="bg-zinc-800 border-zinc-700 text-white"
              min="0"
              step="0.5"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!quitDate}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            Start My Journey
          </Button>
        </div>
      </Card>
    </div>
  );
}
