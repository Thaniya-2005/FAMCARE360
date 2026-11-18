import React, { useState, useEffect, useCallback } from "react";
import {
  Utensils, Droplets, Moon, Activity, Smile, CalendarCheck,
  ChevronRight, Plus, CheckCircle, Clock, Circle
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { CircularGauge } from "@/components/parent/CircularGauge";
import { LogDailyCareModal } from "@/components/parent/LogDailyCareModal";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData, getDefaultHealthData } from "@/types/health";
import { supabase } from "@/integrations/supabase/client";

interface ChildRecord {
  id: string;
  name: string;
  age: number | null;
  linked_user_id?: string | null;
}

export const ParentCare: React.FC = () => {
  const { user } = useAuth();

  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("self");
  const [healthData, setHealthData] = useState<HealthData>(getDefaultHealthData);
  const [isLogCareOpen, setIsLogCareOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: childRows } = await supabase
        .from("children")
        .select("id, name, age, linked_user_id")
        .eq("parent_id", user.id);
      if (childRows) {
        setChildren(childRows as ChildRecord[]);
      }

      let targetId = user.id;
      if (selectedMember !== "self") {
        const selChild = childRows?.find((c) => c.id === selectedMember);
        if (selChild?.linked_user_id) {
          targetId = selChild.linked_user_id;
        }
      }

      const report = await healthService.getTodayHealthReport(targetId);
      if (report) {
        setHealthData(report);
      }
    } catch {
      // Fallback
    }
  }, [user, selectedMember]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeName =
    selectedMember === "self"
      ? "Your"
      : children.find((c) => c.id === selectedMember)?.name || "Member";

  // Care category progress calculations
  const mealsLogged = healthData.mealsEaten || 2;
  const waterGlasses = healthData.waterIntake || 5;
  const sleepHrs = healthData.sleepHours || 7.5;
  const exerciseMin = healthData.exerciseMinutes || 30;

  const categories = [
    {
      id: "food",
      title: "Food & Nutrition",
      subtitle: `${mealsLogged} of 3 meals logged`,
      progress: Math.min(100, Math.round((mealsLogged / 3) * 100)),
      icon: Utensils,
      color: "text-[#22B96B]",
      bgColor: "bg-[#F0FDF4] dark:bg-emerald-950/30",
      barColor: "bg-[#22B96B]",
    },
    {
      id: "water",
      title: "Water & Hydration",
      subtitle: `${waterGlasses} of 6 glasses (${(waterGlasses * 0.25).toFixed(2)} L)`,
      progress: Math.min(100, Math.round((waterGlasses / 6) * 100)),
      icon: Droplets,
      color: "text-[#0284C7]",
      bgColor: "bg-[#E0F2FE] dark:bg-sky-950/30",
      barColor: "bg-[#0284C7]",
    },
    {
      id: "sleep",
      title: "Sleep & Rest",
      subtitle: `${sleepHrs} h of 8 h goal`,
      progress: Math.min(100, Math.round((sleepHrs / 8) * 100)),
      icon: Moon,
      color: "text-[#9333EA]",
      bgColor: "bg-[#F5F3FF] dark:bg-purple-950/30",
      barColor: "bg-[#9333EA]",
    },
    {
      id: "activity",
      title: "Physical Activity",
      subtitle: `${exerciseMin} of 45 min`,
      progress: Math.min(100, Math.round((exerciseMin / 45) * 100)),
      icon: Activity,
      color: "text-[#D97706]",
      bgColor: "bg-[#FFFBEB] dark:bg-amber-950/30",
      barColor: "bg-[#D97706]",
    },
    {
      id: "mood",
      title: "Mental Well-being",
      subtitle: "Mood: Happy 😊",
      progress: 100,
      icon: Smile,
      color: "text-[#E11D48]",
      bgColor: "bg-[#FFF1F2] dark:bg-rose-950/30",
      barColor: "bg-[#E11D48]",
    },
    {
      id: "routine",
      title: "Daily Routine",
      subtitle: "4 of 5 tasks completed",
      progress: 80,
      icon: CalendarCheck,
      color: "text-[#159FA6]",
      bgColor: "bg-[#E6F8F7] dark:bg-teal-950/30",
      barColor: "bg-[#159FA6]",
    },
  ];

  return (
    <ParentLayout title="Daily Care">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* =========================================================================
            1. HERO BANNER matching Reference 4
        ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#159FA6] via-[#1FAFB6] to-[#42C5C9] p-6 sm:p-7 text-white shadow-lg shadow-[#159FA6]/20">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Daily Care
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Manage daily routines, nutrition, sleep, activity and overall well-being.
            </p>
          </div>

          <div className="absolute right-4 -bottom-4 opacity-25 sm:opacity-35 pointer-events-none">
            <svg width="170" height="150" viewBox="0 0 180 150" fill="none">
              <rect x="30" y="20" width="110" height="130" rx="16" fill="white" />
              <rect x="55" y="10" width="60" height="20" rx="8" fill="#087B88" />
              <circle cx="55" cy="55" r="7" fill="#159FA6" />
              <rect x="70" y="52" width="55" height="6" rx="3" fill="#087B88" />
              <circle cx="55" cy="80" r="7" fill="#159FA6" />
              <rect x="70" y="77" width="55" height="6" rx="3" fill="#087B88" />
              <circle cx="55" cy="105" r="7" fill="#159FA6" />
              <rect x="70" y="102" width="45" height="6" rx="3" fill="#087B88" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            2. FILTERS ROW: Family member selector & Date selector
        ========================================================================== */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] bg-white dark:bg-[#111A24] text-xs sm:text-sm font-bold text-[#102443] dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#159FA6]"
          >
            <option value="self">You (Primary Parent)</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.age ? `(Age ${c.age})` : ""}
              </option>
            ))}
          </select>

          <div className="py-2.5 px-3.5 rounded-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] bg-white dark:bg-[#111A24] text-xs sm:text-sm font-bold text-[#102443] dark:text-white shadow-sm flex items-center justify-between">
            <span>Today, Nov 18</span>
            <CalendarCheck className="w-4 h-4 text-[#159FA6]" />
          </div>
        </div>

        {/* =========================================================================
            3. TODAY'S CARE SUMMARY CARD matching Reference 4
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Circular Gauge */}
            <div className="flex justify-center sm:justify-start sm:pl-4">
              <CircularGauge
                score={88}
                label="Daily Care Score"
                size={135}
                strokeWidth={11}
              />
            </div>

            {/* Care Summary status columns */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-sm text-[#102443] dark:text-white">
                  Today's Care Summary
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F8F0] dark:bg-emerald-950/40 text-[#22B96B] text-xs font-bold">
                  <CheckCircle className="w-3 h-3" />
                  <span>On Track</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#E2EEF1] dark:border-[#1E2C3A]">
                <div>
                  <CheckCircle className="w-5 h-5 text-[#22B96B] mx-auto mb-1" />
                  <div className="text-lg font-black text-[#102443] dark:text-white">4</div>
                  <div className="text-[11px] font-medium text-[#60738F]">Completed</div>
                </div>
                <div className="border-x border-[#E2EEF1] dark:border-[#1E2C3A]">
                  <Clock className="w-5 h-5 text-[#F3A623] mx-auto mb-1" />
                  <div className="text-lg font-black text-[#102443] dark:text-white">1</div>
                  <div className="text-[11px] font-medium text-[#60738F]">In Progress</div>
                </div>
                <div>
                  <Circle className="w-5 h-5 text-[#90A4AE] mx-auto mb-1" />
                  <div className="text-lg font-black text-[#102443] dark:text-white">0</div>
                  <div className="text-[11px] font-medium text-[#60738F]">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. CARE CATEGORIES LIST WITH DYNAMIC PROGRESS BARS matching Reference 4
        ========================================================================== */}
        <div className="space-y-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setIsLogCareOpen(true)}
                className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl ${cat.bgColor} ${cat.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#102443] dark:text-white truncate">
                      {cat.title}
                    </div>
                    <div className="text-xs text-[#60738F] dark:text-[#A0B0C0] truncate mt-0.5">
                      {cat.subtitle}
                    </div>
                  </div>
                </div>

                {/* Progress bar & percentage */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 sm:w-32 bg-[#E2EEF1] dark:bg-[#1E2C3A] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${cat.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#102443] dark:text-white w-9 text-right">
                    {cat.progress}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            5. PRIMARY ACTION BUTTON matching Reference 4
        ========================================================================== */}
        <button
          onClick={() => setIsLogCareOpen(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#159FA6] hover:bg-[#087B88] text-white font-bold text-base shadow-lg shadow-[#159FA6]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" />
          <span>+ Log Today's Care</span>
        </button>
      </div>

      {/* Log Daily Care Modal */}
      <LogDailyCareModal
        isOpen={isLogCareOpen}
        onClose={() => setIsLogCareOpen(false)}
        onCareLogged={loadData}
      />
    </ParentLayout>
  );
};

export default ParentCare;
