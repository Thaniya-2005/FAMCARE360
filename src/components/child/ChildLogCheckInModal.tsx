import React, { useState } from "react";
import { X, Utensils, Droplets, Moon, Activity, Smile, CalendarCheck, Loader2 } from "lucide-react";
import { healthService, MealItem, ExerciseLogItem } from "@/services/healthService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChildLogCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTab?: "food" | "water" | "sleep" | "activity" | "wellbeing" | "routine";
}

export const ChildLogCheckInModal: React.FC<ChildLogCheckInModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "food",
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  // 1. Food
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("350");

  // 2. Water
  const [waterCups, setWaterCups] = useState(6);

  // 3. Sleep
  const [sleepHours, setSleepHours] = useState("7.5");
  const [sleepQuality, setSleepQuality] = useState(4);

  // 4. Activity
  const [activityName, setActivityName] = useState("Running & Outdoor Play");
  const [activityMinutes, setActivityMinutes] = useState("30");
  const [activityCalories, setActivityCalories] = useState("120");

  // 5. Mental Well-being
  const [moodScore, setMoodScore] = useState(4);
  const [stressLevel, setStressLevel] = useState(2);
  const [emotionalNotes, setEmotionalNotes] = useState("");

  // 6. Routine tasks
  const [tasks, setTasks] = useState([
    { id: "1", title: "Brushed teeth morning & night", completed: true },
    { id: "2", title: "Completed homework / reading", completed: true },
    { id: "3", title: "Outdoor fresh air / playtime", completed: true },
    { id: "4", title: "Drank water throughout the day", completed: true },
    { id: "5", title: "Packed bag for tomorrow", completed: false },
  ]);

  if (!isOpen) return null;

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      if (activeTab === "food") {
        if (!mealName.trim()) {
          toast({ title: "Meal name required", description: "Please enter what you ate.", variant: "destructive" });
          setIsSubmitting(false);
          return;
        }
        await healthService.saveMeal(user.id, {
          name: mealName.trim(),
          mealType,
          calories: parseInt(mealCalories) || 250,
          protein: 10,
          carbs: 35,
          fat: 8,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        toast({ title: "Meal Logged! 🍽️", description: `${mealName} recorded under ${mealType}.` });
      } else if (activeTab === "water") {
        // Update today's health report with water cups
        const existing = await healthService.getTodayHealthReport(user.id);
        await healthService.saveHealthReport(user.id, {
          date: today,
          waterIntake: waterCups,
          heartRate: existing?.heartRate ?? 76,
          temperature: existing?.temperature ?? 98.4,
          moodScore: existing?.moodScore ?? moodScore,
          sleepHours: existing?.sleepHours ?? 7.5,
        });
        toast({ title: "Hydration Updated! 💧", description: `${waterCups} glasses logged for today.` });
      } else if (activeTab === "sleep") {
        const existing = await healthService.getTodayHealthReport(user.id);
        await healthService.saveHealthReport(user.id, {
          date: today,
          sleepHours: parseFloat(sleepHours) || 7.5,
          sleepQuality,
          heartRate: existing?.heartRate ?? 76,
          temperature: existing?.temperature ?? 98.4,
          moodScore: existing?.moodScore ?? moodScore,
          waterIntake: existing?.waterIntake ?? 6,
        });
        toast({ title: "Sleep Logged! 🌙", description: `${sleepHours} hours recorded.` });
      } else if (activeTab === "activity") {
        await healthService.saveExercise(user.id, {
          exerciseId: "play_" + Date.now(),
          name: activityName,
          duration: parseInt(activityMinutes) || 30,
          caloriesBurned: parseInt(activityCalories) || 100,
          totalReps: 1,
          sets: [{ reps: 1, completed: true }],
          timestamp: new Date().toISOString(),
        });
        toast({ title: "Activity Recorded! 🏃", description: `${activityName} for ${activityMinutes} min.` });
      } else if (activeTab === "wellbeing") {
        const existing = await healthService.getTodayHealthReport(user.id);
        await healthService.saveHealthReport(user.id, {
          date: today,
          moodScore,
          stressLevel,
          emotionalNotes: emotionalNotes.trim() || undefined,
          heartRate: existing?.heartRate ?? 76,
          temperature: existing?.temperature ?? 98.4,
          waterIntake: existing?.waterIntake ?? 6,
          sleepHours: existing?.sleepHours ?? 7.5,
        });
        toast({ title: "Well-being Check-in Saved! 😊", description: "Your feelings were recorded safely." });
      } else if (activeTab === "routine") {
        const completedCount = tasks.filter((t) => t.completed).length;
        toast({
          title: "Daily Routine Saved! ✅",
          description: `${completedCount} of ${tasks.length} routine activities marked complete.`,
        });
      }

      // Notify linked parent of child daily care check-in
      const childName = profile?.full_name || "Your child";
      await healthService.notifyParentOfCheckIn(user.id, childName, activeTab);

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving check-in";
      toast({ title: "Save Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { key: "food", label: "Food", icon: Utensils, color: "text-[#D83A6F] bg-[#FFEBF0]" },
    { key: "water", label: "Water", icon: Droplets, color: "text-[#2980B9] bg-[#E8F4FD]" },
    { key: "sleep", label: "Sleep", icon: Moon, color: "text-[#8960D0] bg-[#F0EAFE]" },
    { key: "activity", label: "Activity", icon: Activity, color: "text-[#E67E22] bg-[#FFF4E6]" },
    { key: "wellbeing", label: "Mood", icon: Smile, color: "text-[#1ABC9C] bg-[#E8F8F5]" },
    { key: "routine", label: "Routine", icon: CalendarCheck, color: "text-[#7D3C98] bg-[#F4EFFE]" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAF0FF] dark:border-[#202F40]">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#172443] dark:text-white">
              Log Daily Check-in
            </h3>
            <p className="text-[11px] sm:text-xs text-[#64718B] dark:text-[#A0B0C0]">
              Keep your health streak up! Select what to record:
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector - Scrollable row for mobile screens */}
        <div className="flex items-center gap-1.5 pt-3 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[56px] flex flex-col items-center justify-center py-2 px-1.5 rounded-2xl transition-all ${
                  isSel
                    ? "bg-gradient-to-br from-[#5369D7] to-[#8960D0] text-white shadow-md shadow-[#5369D7]/20 scale-102"
                    : "bg-[#F6F7FC] dark:bg-[#1A2533] text-[#64718B] hover:bg-[#EAF0FF]"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] font-bold leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {activeTab === "food" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1.5">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        mealType === t
                          ? "bg-[#5369D7] text-white shadow-sm"
                          : "bg-[#F6F7FC] dark:bg-[#1A2533] text-[#64718B] hover:bg-gray-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  What did you eat?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oatmeal with strawberries & honey"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Estimated Calories (Optional)
                </label>
                <input
                  type="number"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>
            </div>
          )}

          {activeTab === "water" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-[#E8F4FD] flex items-center justify-center mx-auto text-[#2980B9]">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <div className="text-3xl font-black text-[#172443] dark:text-white">
                  {waterCups} Glasses
                </div>
                <div className="text-xs text-[#64718B] mt-1">
                  Approx. {(waterCups * 0.25).toFixed(2)} Liters of water today
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setWaterCups((c) => Math.max(0, c - 1))}
                  className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setWaterCups((c) => c + 1)}
                  className="w-16 h-12 rounded-2xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-xl font-bold text-white shadow-md shadow-[#5369D7]/20"
                >
                  +1 💧
                </button>
              </div>
            </div>
          )}

          {activeTab === "sleep" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Hours of Sleep
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1.5">
                  Sleep Quality (1 - 5)
                </label>
                <div className="flex items-center justify-between gap-1.5">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(q)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                        sleepQuality === q
                          ? "bg-[#8960D0] text-white shadow-sm"
                          : "bg-[#F6F7FC] dark:bg-[#1A2533] text-[#64718B]"
                      }`}
                    >
                      {q === 5 ? "⭐⭐⭐⭐⭐" : q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={activityMinutes}
                    onChange={(e) => setActivityMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                    Burned (kcal)
                  </label>
                  <input
                    type="number"
                    value={activityCalories}
                    onChange={(e) => setActivityCalories(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "wellbeing" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1.5">
                  How are you feeling right now?
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    { score: 1, emoji: "😟", label: "Sad" },
                    { score: 2, emoji: "😕", label: "Low" },
                    { score: 3, emoji: "😐", label: "Okay" },
                    { score: 4, emoji: "🙂", label: "Good" },
                    { score: 5, emoji: "😊", label: "Great" },
                  ].map((m) => (
                    <button
                      key={m.score}
                      type="button"
                      onClick={() => setMoodScore(m.score)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center transition-all ${
                        moodScore === m.score
                          ? "bg-[#1ABC9C] text-white shadow-md scale-105"
                          : "bg-[#F6F7FC] dark:bg-[#1A2533] text-[#64718B]"
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] font-bold mt-1">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Want to share a quick thought or note? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={emotionalNotes}
                  onChange={(e) => setEmotionalNotes(e.target.value)}
                  placeholder="e.g. Played soccer with friends at lunch!"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>
            </div>
          )}

          {activeTab === "routine" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                Today's Habits & Routine Checklist
              </label>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    task.completed
                      ? "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40"
                      : "bg-[#F6F7FC] dark:bg-[#1A2533] border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-[#8960D0] focus:ring-[#8960D0]"
                  />
                  <span
                    className={`text-xs font-medium ${
                      task.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : "text-[#172443] dark:text-white font-semibold"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#EAF0FF] dark:border-[#202F40]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-xs font-bold shadow-md shadow-[#5369D7]/20 flex items-center justify-center gap-2 hover:opacity-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Check-in</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildLogCheckInModal;
