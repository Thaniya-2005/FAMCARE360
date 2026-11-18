import React, { useState, useEffect, useCallback } from "react";
import {
  Utensils,
  Droplets,
  Moon,
  Activity,
  Smile,
  CalendarCheck,
  ChevronRight,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildCircularGauge } from "@/components/child/ChildCircularGauge";
import { ChildLogCheckInModal } from "@/components/child/ChildLogCheckInModal";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData } from "@/types/health";

export const ChildCheckIn: React.FC = () => {
  const { user, profile } = useAuth();

  const [todayHealth, setTodayHealth] = useState<HealthData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<
    "food" | "water" | "sleep" | "activity" | "wellbeing" | "routine"
  >("food");

  const childName = profile?.full_name?.split(" ")[0] || "Arjun";

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const parentId = await healthService.getLinkedParentId(user.id);
      const targetId = parentId || user.id;

      const report = await healthService.getTodayHealthReport(targetId);
      setTodayHealth(report);
    } catch (err) {
      console.warn("ChildCheckIn load warning:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const mealsCount = todayHealth?.mealsEaten ?? 2;
  const waterCount = todayHealth?.waterIntake ?? 5;
  const sleepHrs = todayHealth?.sleepHours ?? 7.5;
  const activityMins = todayHealth?.exerciseMinutes || 30;
  const moodScore = todayHealth?.moodScore ?? 4;

  const categories = [
    {
      key: "food" as const,
      title: "Food & Nutrition",
      subtitle: `${mealsCount} of 3 meals logged`,
      progress: Math.min(100, Math.round((mealsCount / 3) * 100)),
      icon: Utensils,
      color: "text-[#D83A6F] bg-[#FFEBF0]",
    },
    {
      key: "water" as const,
      title: "Water & Hydration",
      subtitle: `${waterCount} of 6 glasses (${(waterCount * 0.25).toFixed(2)} L)`,
      progress: Math.min(100, Math.round((waterCount / 6) * 100)),
      icon: Droplets,
      color: "text-[#2980B9] bg-[#E8F4FD]",
    },
    {
      key: "sleep" as const,
      title: "Sleep & Rest",
      subtitle: `${sleepHrs} h of 8 h goal`,
      progress: Math.min(100, Math.round((sleepHrs / 8) * 100)),
      icon: Moon,
      color: "text-[#8960D0] bg-[#F0EAFE]",
    },
    {
      key: "activity" as const,
      title: "Physical Activity",
      subtitle: `${activityMins} of 45 min`,
      progress: Math.min(100, Math.round((activityMins / 45) * 100)),
      icon: Activity,
      color: "text-[#E67E22] bg-[#FFF4E6]",
    },
    {
      key: "wellbeing" as const,
      title: "Mental Well-being",
      subtitle: `Mood: ${["Sad", "Low", "Neutral", "Good", "Happy"][moodScore - 1] || "Happy"} 😊`,
      progress: 100,
      icon: Smile,
      color: "text-[#1ABC9C] bg-[#E8F8F5]",
    },
    {
      key: "routine" as const,
      title: "Daily Routine",
      subtitle: "4 of 5 tasks completed",
      progress: 80,
      icon: CalendarCheck,
      color: "text-[#7D3C98] bg-[#F4EFFE]",
    },
  ];

  const overallProgress = Math.round(
    categories.reduce((acc, c) => acc + c.progress, 0) / categories.length
  );

  const openTab = (tab: "food" | "water" | "sleep" | "activity" | "wellbeing" | "routine") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <ChildLayout
      title="Daily Check-in"
      currentVitals={{
        heartRate: todayHealth?.heartRate,
        temperature: todayHealth?.temperature,
      }}
    >
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 3 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight mb-1">
                Daily Check-in
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                Track your meals, water, sleep, activity and overall well-being.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <CalendarCheck className="w-8 h-8 text-white fill-white/20" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white">
            <span>👤</span>
            <span>{childName} (Me)</span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white">
            <span>📅 Today, Nov 18</span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>
        </div>

        {/* SECTION A: TODAY'S SUMMARY */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between gap-4">
            <ChildCircularGauge
              score={overallProgress}
              label="Check-in Progress"
              size={120}
              strokeWidth={10}
            />

            <div className="space-y-2 flex-1 pr-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-[#172443] dark:text-white">
                  Today's Summary
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F5] text-[#22B96B]">
                  <CheckCircle className="w-3 h-3" />
                  <span>On Track</span>
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
                <div className="flex flex-col items-center flex-1 p-1.5 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-3.5 h-3.5 mb-0.5" />
                  <span className="font-bold">4</span>
                  <span className="text-[9px]">Completed</span>
                </div>
                <div className="flex flex-col items-center flex-1 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300">
                  <Clock className="w-3.5 h-3.5 mb-0.5" />
                  <span className="font-bold">1</span>
                  <span className="text-[9px]">In Progress</span>
                </div>
                <div className="flex flex-col items-center flex-1 p-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-400 mb-0.5" />
                  <span className="font-bold">1</span>
                  <span className="text-[9px]">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: PROGRESS LIST */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40] space-y-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                onClick={() => openTab(cat.key)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors group"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${cat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#172443] dark:text-white truncate">
                      {cat.title}
                    </span>
                    <span className="text-xs font-black text-[#5369D7] ml-2">
                      {cat.progress}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64718B] dark:text-[#A0B0C0] truncate mb-1.5">
                    {cat.subtitle}
                  </div>

                  {/* Progress bar with purple gradient fill */}
                  <div className="w-full h-1.5 bg-[#EAF0FF] dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5369D7] to-[#8960D0] rounded-full transition-all duration-500"
                      style={{ width: `${cat.progress}%` }}
                    />
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5369D7] group-hover:translate-x-0.5 transition-transform" />
              </div>
            );
          })}
        </div>

        {/* PRIMARY CTA: + Log Today's Check-in */}
        <button
          onClick={() => {
            setModalTab("food");
            setIsModalOpen(true);
          }}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white font-bold text-sm shadow-md shadow-[#5369D7]/25 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Today's Check-in</span>
        </button>
      </div>

      <ChildLogCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onSuccess={loadData}
      />
    </ChildLayout>
  );
};

export default ChildCheckIn;
