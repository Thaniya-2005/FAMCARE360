import React, { useState } from "react";
import { X, Utensils, Droplets, Moon, Activity, Smile, CheckSquare, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";
import { getDefaultHealthData } from "@/types/health";

interface LogDailyCareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCareLogged: () => void;
}

export const LogDailyCareModal: React.FC<LogDailyCareModalProps> = ({
  isOpen,
  onClose,
  onCareLogged,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"food" | "water" | "sleep" | "activity" | "mood">("food");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Food state
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("350");

  // Water state
  const [waterCups, setWaterCups] = useState(6);

  // Sleep state
  const [sleepHours, setSleepHours] = useState("7.5");
  const [sleepQuality, setSleepQuality] = useState(4);

  // Activity state
  const [activityName, setActivityName] = useState("Brisk Walk / Playground");
  const [activityMinutes, setActivityMinutes] = useState("30");
  const [activityCalories, setActivityCalories] = useState("120");

  // Mood state
  const [moodRating, setMoodRating] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. If meal logged
      if (mealName.trim()) {
        const cal = parseInt(mealCalories) || 300;
        await healthService.addMeal(user.id, today, {
          name: mealName.trim(),
          calories: cal,
          protein: 15,
          carbs: 45,
          fat: 10,
          mealType,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }

      // 2. If water updated
      await healthService.saveWaterIntake(user.id, today, waterCups);

      // 3. Update health report summary
      const existing = (await healthService.getTodayHealthReport(user.id)) || getDefaultHealthData();
      existing.date = today;
      existing.waterIntake = waterCups;
      existing.sleepHours = parseFloat(sleepHours) || 7.5;
      existing.sleepQuality = sleepQuality;
      existing.exerciseMinutes = parseInt(activityMinutes) || 30;
      existing.activeCalories = parseInt(activityCalories) || 120;
      existing.moodScore = moodRating;

      await healthService.saveHealthReport(user.id, existing);

      toast({
        title: "Daily Care Saved! 🌟",
        description: "Your family care log has been updated.",
      });

      onCareLogged();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record daily care";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#60738F] hover:text-[#102443] dark:hover:text-white p-1.5 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Log Today's Care
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Record meals, hydration, sleep, exercise and well-being.
            </p>
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] border border-[#E2EEF1] dark:border-[#1E2C3A] mb-5 overflow-x-auto">
          {[
            { id: "food", label: "Meals", icon: Utensils },
            { id: "water", label: "Hydration", icon: Droplets },
            { id: "sleep", label: "Sleep", icon: Moon },
            { id: "activity", label: "Activity", icon: Activity },
            { id: "mood", label: "Mood", icon: Smile },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                  active
                    ? "bg-white dark:bg-[#111A24] text-[#159FA6] shadow-sm"
                    : "text-[#60738F] hover:text-[#102443]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "food" && (
            <div className="space-y-3.5">
              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
                  Meal Category
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealType(m)}
                      className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                        mealType === m
                          ? "bg-[#159FA6] text-white border-[#159FA6]"
                          : "bg-white dark:bg-[#182330] text-[#60738F] border-[#E2EEF1] hover:border-[#159FA6]"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                  Meal Description
                </Label>
                <Input
                  placeholder="e.g. Oatmeal with blueberries, Grilled chicken salad..."
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="rounded-xl border-[#E2EEF1]"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                  Estimated Calories (kcal)
                </Label>
                <Input
                  type="number"
                  placeholder="350"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  className="rounded-xl border-[#E2EEF1]"
                />
              </div>
            </div>
          )}

          {activeTab === "water" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] flex items-center justify-center mx-auto">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <span className="text-3xl font-black text-[#102443] dark:text-white">
                  {waterCups} Glasses
                </span>
                <span className="text-xs text-[#60738F] block mt-0.5">
                  Approx. {(waterCups * 0.25).toFixed(2)} Liters
                </span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setWaterCups(Math.max(0, waterCups - 1))}
                  className="w-10 h-10 rounded-full bg-muted font-black text-lg text-foreground hover:bg-muted/80"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setWaterCups(waterCups + 1)}
                  className="w-10 h-10 rounded-full bg-[#159FA6] font-black text-lg text-white hover:bg-[#087B88]"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {activeTab === "sleep" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                  Total Sleep Duration (Hours)
                </Label>
                <Input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  placeholder="7.5"
                  className="rounded-xl border-[#E2EEF1]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold text-[#102443] dark:text-white">
                    Sleep Quality (1 = Restless, 5 = Deep & Rested)
                  </Label>
                  <span className="text-xs font-bold text-[#159FA6]">{sleepQuality}/5</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[sleepQuality]}
                  onValueChange={([v]) => setSleepQuality(v)}
                  className="py-2"
                />
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3.5">
              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                  Exercise / Activity Name
                </Label>
                <Input
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g. Swimming, Cycling, Outdoor play"
                  className="rounded-xl border-[#E2EEF1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Duration (Minutes)
                  </Label>
                  <Input
                    type="number"
                    value={activityMinutes}
                    onChange={(e) => setActivityMinutes(e.target.value)}
                    placeholder="30"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Calories Burned (kcal)
                  </Label>
                  <Input
                    type="number"
                    value={activityCalories}
                    onChange={(e) => setActivityCalories(e.target.value)}
                    placeholder="120"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "mood" && (
            <div className="space-y-4 py-2">
              <Label className="text-xs font-bold text-[#102443] dark:text-white mb-2 block text-center">
                How is your family member feeling today?
              </Label>
              <div className="flex justify-around items-center">
                {[
                  { score: 1, emoji: "😟", label: "Sad" },
                  { score: 2, emoji: "😕", label: "Low" },
                  { score: 3, emoji: "😐", label: "Okay" },
                  { score: 4, emoji: "🙂", label: "Good" },
                  { score: 5, emoji: "😊", label: "Happy" },
                ].map((item) => (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setMoodRating(item.score)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                      moodRating === item.score
                        ? "bg-[#E6F8F7] dark:bg-[#159FA6]/20 scale-110 ring-2 ring-[#159FA6]"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-[10px] font-bold text-[#60738F]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#159FA6] to-[#087B88] text-white shadow-md shadow-[#159FA6]/20 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogDailyCareModal;
