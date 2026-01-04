import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Plus, Target, Check, Trash2 } from "lucide-react";

export interface Plan {
  id: string;
  title: string;
  description: string;
  strategies: string[];
  completed: boolean;
}

interface PlansProps {
  plans: Plan[];
  onAddPlan: (plan: Omit<Plan, "id">) => void;
  onTogglePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

export function Plans({ plans, onAddPlan, onTogglePlan, onDeletePlan }: PlansProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("");
  const [strategies, setStrategies] = useState<string[]>([]);

  const handleAddStrategy = () => {
    if (strategy.trim()) {
      setStrategies([...strategies, strategy.trim()]);
      setStrategy("");
    }
  };

  const handleSubmit = () => {
    if (title.trim() && description.trim()) {
      onAddPlan({
        title: title.trim(),
        description: description.trim(),
        strategies,
        completed: false,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setStrategies([]);
      setShowForm(false);
    }
  };

  const suggestedPlans = [
    {
      title: "Replace the Habit",
      description: "Substitute vaping with healthier alternatives",
      strategies: [
        "Chew sugar-free gum when you get cravings",
        "Take deep breaths for 5 minutes",
        "Go for a short walk",
        "Drink water or herbal tea",
      ],
    },
    {
      title: "Avoid Triggers",
      description: "Identify and manage situations that trigger cravings",
      strategies: [
        "Avoid places where you used to vape",
        "Stay away from friends who vape",
        "Remove all vaping devices and pods",
        "Change your daily routine",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white">My Plans</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Plan
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="space-y-4">
            <div>
              <Label className="text-white">Plan Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Replace the Habit"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            
            <div>
              <Label className="text-white">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your plan..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Strategies</Label>
              <div className="flex gap-2">
                <Input
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Add a strategy..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddStrategy();
                    }
                  }}
                />
                <Button onClick={handleAddStrategy} size="sm" variant="outline" className="border-zinc-700">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {strategies.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {strategies.map((s, idx) => (
                    <li key={idx} className="text-sm text-zinc-400 flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 flex-1">
                Save Plan
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  setTitle("");
                  setDescription("");
                  setStrategies([]);
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

      {plans.length === 0 && !showForm && (
        <div className="space-y-3">
          <p className="text-zinc-500 text-sm">Try one of these suggested plans:</p>
          {suggestedPlans.map((plan, idx) => (
            <Card
              key={idx}
              className="p-4 bg-zinc-900 border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
              onClick={() => {
                onAddPlan({
                  title: plan.title,
                  description: plan.description,
                  strategies: plan.strategies,
                  completed: false,
                });
              }}
            >
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white mb-1">{plan.title}</h4>
                  <p className="text-sm text-zinc-400">{plan.description}</p>
                </div>
                <Plus className="w-5 h-5 text-zinc-600" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-4 border-zinc-800 transition-colors ${
              plan.completed ? "bg-zinc-900/50" : "bg-zinc-900"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => onTogglePlan(plan.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  plan.completed
                    ? "bg-green-600 border-green-600"
                    : "border-zinc-600 hover:border-zinc-500"
                }`}
              >
                {plan.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex-1">
                <h4 className={`mb-1 ${plan.completed ? "text-zinc-500 line-through" : "text-white"}`}>
                  {plan.title}
                </h4>
                <p className="text-sm text-zinc-400 mb-2">{plan.description}</p>
                
                {plan.strategies.length > 0 && (
                  <ul className="space-y-1">
                    {plan.strategies.map((s, idx) => (
                      <li key={idx} className="text-xs text-zinc-500 flex items-center gap-2">
                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                onClick={() => onDeletePlan(plan.id)}
                className="text-zinc-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
