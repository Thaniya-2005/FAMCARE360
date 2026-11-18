import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  AlertTriangle,
  Utensils,
  Droplets,
  Moon,
  Activity,
  Smile,
  CalendarCheck,
  Pill,
  Calendar,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildCircularGauge } from "@/components/child/ChildCircularGauge";
import { ChildLogCheckInModal } from "@/components/child/ChildLogCheckInModal";
import { ChildEmergencySOSDialog } from "@/components/child/ChildEmergencySOSDialog";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData, Medication, Appointment } from "@/types/health";
import { supabase } from "@/integrations/supabase/client";

export const ChildHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [todayHealth, setTodayHealth] = useState<HealthData | null>(null);
  const [nextMedicine, setNextMedicine] = useState<Medication | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInInitialTab, setCheckInInitialTab] = useState<
    "food" | "water" | "sleep" | "activity" | "wellbeing" | "routine"
  >("food");

  const childName = profile?.full_name?.split(" ")[0] || "Arjun";

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Get linked parent ID or user ID
      const parentId = await healthService.getLinkedParentId(user.id);
      const targetId = parentId || user.id;

      // 2. Load today's health report
      const report = await healthService.getTodayHealthReport(targetId);
      setTodayHealth(report);

      // 3. Load medications (from parent if linked, or child)
      const meds = await healthService.getMedications(targetId);
      if (meds && meds.length > 0) {
        // Pick first untaken or upcoming med
        const upcoming = meds.find((m) => !m.taken) || meds[0];
        setNextMedicine(upcoming);
      } else {
        setNextMedicine({
          name: "Vitamin D3",
          dose: "1 tablet",
          time: "Today, 8:00 PM",
          frequency: "Daily",
          taken: false,
          refillNeeded: false,
        });
      }

      // 4. Load appointments
      const appts = await healthService.getAppointments(targetId);
      if (appts && appts.length > 0) {
        const upcoming = appts.find((a) => !a.completed) || appts[0];
        setNextAppointment(upcoming);
      } else {
        setNextAppointment({
          title: "Pediatric Checkup",
          doctor: "Dr. Neha Rao",
          date: "Nov 20",
          time: "4:00 PM",
          completed: false,
          notes: "Routine health screening",
        });
      }
    } catch (err) {
      console.warn("ChildHome data load warning:", err);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    // Live Realtime updates
    const channel = supabase
      .channel("child_home_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "health_reports" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medications" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // Derived progress and health metrics
  const wellnessScore = todayHealth?.lifestyleScore ?? 85;
  const foodCount = todayHealth?.mealsEaten ?? 2;
  const waterCups = todayHealth?.waterIntake ?? 5;
  const sleepHours = todayHealth?.sleepHours ?? 7.5;
  const activityMin = todayHealth?.exerciseMinutes || (todayHealth?.stepsCount ? Math.round(todayHealth.stepsCount / 180) : 30);

  const openCheckInTab = (tab: "food" | "water" | "sleep" | "activity" | "wellbeing" | "routine") => {
    setCheckInInitialTab(tab);
    setIsCheckInModalOpen(true);
  };

  return (
    <ChildLayout
      title="Child Dashboard"
      currentVitals={{
        heartRate: todayHealth?.heartRate,
        temperature: todayHealth?.temperature,
      }}
    >
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 1 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-1.5 mb-1">
                <span>Hi, {childName}!</span>
                <span className="text-xl">👋</span>
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                Here's your health and wellness today.
              </p>
            </div>

            {/* Illustration Graphic */}
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <div className="w-full h-full flex flex-col items-center justify-center text-white">
                <Heart className="w-8 h-8 text-white fill-white/20 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Filter & Emergency SOS Row */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/child/health")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white hover:border-[#5369D7]/40 transition-all"
          >
            <span>👤</span>
            <span>My Dashboard</span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>

          <button
            onClick={() => setIsSOSOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#EF4444] text-white text-xs font-black shadow-md shadow-red-500/25 active:scale-95 hover:bg-red-600 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 fill-white" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* SECTION 1: TODAY'S HEALTH OVERVIEW */}
        <div
          onClick={() => navigate("/child/health")}
          className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40] cursor-pointer hover:border-[#5369D7]/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#172443] dark:text-white leading-tight">
                  Today's Health Overview
                </h2>
                <p className="text-[11px] text-[#64718B] dark:text-[#A0B0C0] leading-tight">
                  Your wellness at a glance
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5369D7] group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="flex items-center justify-between gap-4">
            <ChildCircularGauge
              score={wellnessScore}
              label="Wellness Score"
              size={120}
              strokeWidth={10}
            />

            <div className="space-y-2.5 flex-1 pr-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#22B96B]">
                <CheckCircle className="w-4 h-4" />
                <span>On Track</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F3A623]">
                <Clock className="w-4 h-4" />
                <span>1 Needs Attention</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#64718B] dark:text-[#A0B0C0]">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>No Active Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: TODAY'S CHECK-IN PROGRESS */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#E8F4FD] text-[#5369D7] flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#172443] dark:text-white leading-tight">
                  Today's Check-in Progress
                </h2>
                <p className="text-[11px] text-[#64718B] dark:text-[#A0B0C0] leading-tight">
                  Tue, Nov 18
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/child/check-in")}
              className="text-xs font-bold text-[#8960D0] hover:underline flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6 Mini-Cards Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Food */}
            <div
              onClick={() => openCheckInTab("food")}
              className="p-3 rounded-2xl bg-[#FFEBF0] dark:bg-pink-950/20 text-[#D83A6F] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <Utensils className="w-5 h-5 mb-1 text-[#D83A6F]" />
              <span className="text-xs font-bold leading-tight">Food</span>
              <span className="text-[11px] font-semibold mt-0.5">{foodCount} / 3</span>
            </div>

            {/* Water */}
            <div
              onClick={() => openCheckInTab("water")}
              className="p-3 rounded-2xl bg-[#E8F4FD] dark:bg-blue-950/20 text-[#2980B9] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <Droplets className="w-5 h-5 mb-1 text-[#2980B9]" />
              <span className="text-xs font-bold leading-tight">Water</span>
              <span className="text-[11px] font-semibold mt-0.5">{waterCups} / 6</span>
            </div>

            {/* Sleep */}
            <div
              onClick={() => openCheckInTab("sleep")}
              className="p-3 rounded-2xl bg-[#F0EAFE] dark:bg-purple-950/20 text-[#8960D0] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <Moon className="w-5 h-5 mb-1 text-[#8960D0]" />
              <span className="text-xs font-bold leading-tight">Sleep</span>
              <span className="text-[11px] font-semibold mt-0.5">{sleepHours} h</span>
            </div>

            {/* Activity */}
            <div
              onClick={() => openCheckInTab("activity")}
              className="p-3 rounded-2xl bg-[#FFF4E6] dark:bg-orange-950/20 text-[#E67E22] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <Activity className="w-5 h-5 mb-1 text-[#E67E22]" />
              <span className="text-xs font-bold leading-tight">Activity</span>
              <span className="text-[11px] font-semibold mt-0.5">{activityMin} min</span>
            </div>

            {/* Well-being */}
            <div
              onClick={() => openCheckInTab("wellbeing")}
              className="p-3 rounded-2xl bg-[#E8F8F5] dark:bg-emerald-950/20 text-[#1ABC9C] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <Smile className="w-5 h-5 mb-1 text-[#1ABC9C]" />
              <span className="text-xs font-bold leading-tight">Well-being</span>
              <span className="text-[11px] font-semibold mt-0.5">Good 😊</span>
            </div>

            {/* Routine */}
            <div
              onClick={() => openCheckInTab("routine")}
              className="p-3 rounded-2xl bg-[#F4EFFE] dark:bg-indigo-950/20 text-[#7D3C98] flex flex-col items-center text-center cursor-pointer hover:scale-102 transition-transform"
            >
              <CalendarCheck className="w-5 h-5 mb-1 text-[#7D3C98]" />
              <span className="text-xs font-bold leading-tight">Routine</span>
              <span className="text-[11px] font-semibold mt-0.5">4 / 5</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDICINE & APPOINTMENT SPLIT CARDS */}
        <div className="grid grid-cols-2 gap-3">
          {/* Next Medicine Card */}
          <div
            onClick={() => navigate("/child/medicines")}
            className="p-4 rounded-3xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm cursor-pointer hover:border-[#8960D0]/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
                <Pill className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8960D0] transition-colors" />
            </div>
            <div className="text-[11px] font-bold text-[#64718B] dark:text-[#A0B0C0]">
              Next Medicine
            </div>
            <div className="text-xs font-black text-[#172443] dark:text-white truncate mt-0.5">
              {nextMedicine?.name || "Vitamin D"}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#8960D0] font-semibold mt-1">
              <Clock className="w-3 h-3" />
              <span>{nextMedicine?.time || "Today, 8:00 PM"}</span>
            </div>
          </div>

          {/* Upcoming Appointment Card */}
          <div
            onClick={() => navigate("/child/appointments")}
            className="p-4 rounded-3xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm cursor-pointer hover:border-[#5369D7]/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F4FD] text-[#5369D7] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#5369D7] transition-colors" />
            </div>
            <div className="text-[11px] font-bold text-[#64718B] dark:text-[#A0B0C0]">
              Upcoming Appointment
            </div>
            <div className="text-xs font-black text-[#172443] dark:text-white truncate mt-0.5">
              {nextAppointment?.title || "Pediatric Checkup"}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#5369D7] font-semibold mt-1">
              <Clock className="w-3 h-3" />
              <span>{nextAppointment?.date || "Nov 20"}, {nextAppointment?.time || "4:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: QUICK ACTIONS */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-black text-[#172443] dark:text-white">
              Quick Actions
            </h2>
            <button
              onClick={() => navigate("/child/health")}
              className="text-xs font-bold text-[#8960D0] hover:underline flex items-center"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Add Check-in */}
            <button
              onClick={() => {
                setCheckInInitialTab("food");
                setIsCheckInModalOpen(true);
              }}
              className="p-2.5 rounded-2xl bg-[#F0EAFE] text-[#8960D0] hover:opacity-90 flex flex-col items-center transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold leading-tight">Add Check-in</span>
            </button>

            {/* My Health */}
            <button
              onClick={() => navigate("/child/health")}
              className="p-2.5 rounded-2xl bg-[#E8F4FD] text-[#5369D7] hover:opacity-90 flex flex-col items-center transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold leading-tight">My Health</span>
            </button>

            {/* My Medicines */}
            <button
              onClick={() => navigate("/child/medicines")}
              className="p-2.5 rounded-2xl bg-[#FFEBF0] text-[#D83A6F] hover:opacity-90 flex flex-col items-center transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
                <Pill className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold leading-tight">My Medicines</span>
            </button>

            {/* Appointments */}
            <button
              onClick={() => navigate("/child/appointments")}
              className="p-2.5 rounded-2xl bg-[#FFF8E7] text-[#D4AC0D] hover:opacity-90 flex flex-col items-center transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold leading-tight">Appointments</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <ChildLogCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        initialTab={checkInInitialTab}
        onSuccess={loadData}
      />

      <ChildEmergencySOSDialog
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        currentVitals={{
          heartRate: todayHealth?.heartRate,
          temperature: todayHealth?.temperature,
        }}
      />
    </ChildLayout>
  );
};

export default ChildHome;
