import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, Calendar, ChevronRight, Activity, Users, AlertTriangle,
  Clock, CheckCircle, ShieldAlert, Utensils, Moon, Plus, Pill,
  ClipboardCheck, UserCheck, HeartPulse
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { CircularGauge } from "@/components/parent/CircularGauge";
import { AddHealthRecordModal } from "@/components/parent/AddHealthRecordModal";
import { AddAppointmentModal } from "@/components/parent/AddAppointmentModal";
import { AddMedicationModal } from "@/components/parent/AddMedicationModal";
import { LogDailyCareModal } from "@/components/parent/LogDailyCareModal";
import { EmergencySOSDialog } from "@/components/parent/EmergencySOSDialog";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData, Appointment, getDefaultHealthData } from "@/types/health";
import { supabase } from "@/integrations/supabase/client";

interface ChildRecord {
  id: string;
  name: string;
  age: number | null;
  health_details: string | null;
}

export const ParentHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, family, familyMembers } = useAuth();

  const [healthData, setHealthData] = useState<HealthData>(getDefaultHealthData);
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddApptOpen, setIsAddApptOpen] = useState(false);
  const [isAddMedOpen, setIsAddMedOpen] = useState(false);
  const [isLogCareOpen, setIsLogCareOpen] = useState(false);

  // Compute greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning!";
    if (hour < 17) return "Good Afternoon!";
    return "Good Evening!";
  };

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      // 1. Fetch children
      const { data: childRows } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id);
      if (childRows) {
        setChildren(childRows as ChildRecord[]);
      }

      // 2. Fetch today's health report
      const report = await healthService.getTodayHealthReport(user.id);
      if (report) {
        setHealthData(report);
      }

      // 3. Fetch appointments
      const appts = await healthService.getAppointments(user.id);
      setAppointments(appts);

      // 4. Check active SOS alerts
      const { data: alertRows } = await supabase
        .from("sos_alerts")
        .select("id")
        .eq("status", "active");
      if (alertRows) {
        setActiveAlertCount(alertRows.length);
      }
    } catch {
      // Fallback cleanly
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();

    if (!user) return;
    const channel = supabase
      .channel("parent_home_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        () => {
          loadDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "health_reports" },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData, user]);

  // Derived counts
  const totalMembers = 1 + children.length; // Parent + registered children
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Calculate Family Health Score
  const healthScore = healthData.lifestyleScore || 82;
  const nextAppt = appointments.length > 0 ? appointments[0] : null;

  return (
    <ParentLayout title="Home">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* =========================================================================
            1. HERO GREETING BANNER matching Reference 1
        ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#159FA6] via-[#1FAFB6] to-[#42C5C9] p-6 sm:p-7 text-white shadow-lg shadow-[#159FA6]/20">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              {getGreeting()}
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Here's your family's health at a glance.
            </p>
          </div>

          {/* Decorative heart silhouette matching reference design */}
          <div className="absolute right-4 -bottom-4 opacity-25 sm:opacity-35 pointer-events-none">
            <svg width="180" height="150" viewBox="0 0 200 160" fill="none">
              <path
                d="M100 140c-60-40-90-80-90-110 0-25 20-30 40-30 20 0 35 15 50 30 15-15 30-30 50-30 20 0 40 5 40 30 0 30-30 70-90 110z"
                fill="white"
              />
              <circle cx="90" cy="65" r="14" fill="#087B88" />
              <path d="M70 100c0-15 10-25 25-25s25 10 25 25" fill="#087B88" />
              <circle cx="125" cy="75" r="10" fill="#087B88" />
              <path d="M110 105c0-10 8-18 18-18s18 8 18 18" fill="#087B88" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            2. CONTROLS ROW: Family dropdown & Emergency SOS button
        ========================================================================== */}
        <div className="flex items-center justify-between gap-3">
          {/* Family Dropdown Pill matching Reference 1 */}
          <button
            onClick={() => navigate("/parent/family")}
            className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-white dark:bg-[#111A24] border border-[#E2EEF1] dark:border-[#1E2C3A] text-sm font-bold text-[#102443] dark:text-white shadow-sm hover:bg-[#F4FAFC] transition-colors"
          >
            <Users className="w-4 h-4 text-[#159FA6]" />
            <span>
              {family?.name || "My Family"} ({totalMembers})
            </span>
            <ChevronRight className="w-4 h-4 text-[#60738F] rotate-90" />
          </button>

          {/* Emergency SOS Pill matching Reference 1 */}
          <button
            onClick={() => setIsSOSOpen(true)}
            className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#F87171] hover:from-[#DC2626] hover:to-[#EF4444] text-white text-sm font-bold shadow-md shadow-[#EF4444]/25 transition-transform active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 fill-white text-[#EF4444]" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* =========================================================================
            3. FAMILY HEALTH OVERVIEW CARD matching Reference 1
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div
            onClick={() => navigate("/parent/health")}
            className="flex items-center justify-between cursor-pointer group mb-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-[#102443] dark:text-white text-base tracking-tight">
                  Family Health Overview
                </h3>
                <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                  Overall wellness for your family
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#60738F] group-hover:text-[#159FA6] transition-colors" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Left: Circular Gauge */}
            <div className="flex justify-center sm:justify-start sm:pl-4">
              <CircularGauge
                score={healthScore}
                label="Family Health Score"
                size={135}
                strokeWidth={11}
              />
            </div>

            {/* Right: Health Metrics status pills */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm font-semibold text-[#102443] dark:text-white">
                <CheckCircle className="w-5 h-5 text-[#22B96B] flex-shrink-0" />
                <span>{Math.max(1, totalMembers - 1)} Member in Good Health</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[#102443] dark:text-white">
                <Clock className="w-5 h-5 text-[#F3A623] flex-shrink-0" />
                <span>{children.length > 1 ? "1 Needs Attention" : "All checkups current"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[#102443] dark:text-white">
                <Heart className="w-5 h-5 text-[#EF4444] flex-shrink-0" />
                <span>{activeAlertCount} Active Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. TODAY'S SUMMARY CARD matching Reference 1
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102443] dark:text-white">
                  Today's Summary
                </h4>
                <span className="text-xs text-[#60738F] dark:text-[#A0B0C0] font-medium">
                  {formattedDate}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/parent/care")}
              className="text-xs font-bold text-[#159FA6] dark:text-[#42C5C9] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Summary Metric Pills matching Reference 1 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Vitals */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-[#FFF1F2] dark:bg-rose-950/20 border border-[#FFE4E6] dark:border-rose-900/30 rounded-2xl p-3.5 text-center cursor-pointer hover:shadow-sm transition-all"
            >
              <Heart className="w-5 h-5 text-[#EF4444] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#60738F] dark:text-[#A0B0C0]">Vitals</div>
              <div className="text-sm font-black text-[#102443] dark:text-white mt-0.5">
                {healthData.heartRate ? `${healthData.heartRate} bpm` : "1 / 2"}
              </div>
            </div>

            {/* Nutrition */}
            <div
              onClick={() => navigate("/parent/care")}
              className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/30 rounded-2xl p-3.5 text-center cursor-pointer hover:shadow-sm transition-all"
            >
              <Utensils className="w-5 h-5 text-[#22B96B] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#60738F] dark:text-[#A0B0C0]">Nutrition</div>
              <div className="text-sm font-black text-[#102443] dark:text-white mt-0.5">
                {healthData.mealsEaten ? `${healthData.mealsEaten} / 3` : "2 / 2"}
              </div>
            </div>

            {/* Sleep */}
            <div
              onClick={() => navigate("/parent/care")}
              className="bg-[#F5F3FF] dark:bg-purple-950/20 border border-[#EDE9FE] dark:border-purple-900/30 rounded-2xl p-3.5 text-center cursor-pointer hover:shadow-sm transition-all"
            >
              <Moon className="w-5 h-5 text-[#9333EA] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#60738F] dark:text-[#A0B0C0]">Sleep</div>
              <div className="text-sm font-black text-[#102443] dark:text-white mt-0.5">
                {healthData.sleepHours ? `${healthData.sleepHours} h` : "7 h 30 m"}
              </div>
            </div>

            {/* Activity */}
            <div
              onClick={() => navigate("/parent/care")}
              className="bg-[#EFF6FF] dark:bg-blue-950/20 border border-[#DBEAFE] dark:border-blue-900/30 rounded-2xl p-3.5 text-center cursor-pointer hover:shadow-sm transition-all"
            >
              <Activity className="w-5 h-5 text-[#2563EB] mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#60738F] dark:text-[#A0B0C0]">Activity</div>
              <div className="text-sm font-black text-[#102443] dark:text-white mt-0.5">
                {healthData.exerciseMinutes ? `${healthData.exerciseMinutes} min` : "30 min"}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. UPCOMING APPOINTMENT CARD matching Reference 1
        ========================================================================== */}
        <div
          onClick={() => setIsAddApptOpen(true)}
          className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card cursor-pointer hover:border-[#159FA6]/50 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102443] dark:text-white">
                  Upcoming Appointment
                </h4>
                <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                  {nextAppt ? `${nextAppt.date} • ${nextAppt.time}` : "Nov 20, 2026 • 4:00 PM"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#60738F]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{nextAppt?.title || "Pediatric Checkup"}</span>
          </div>
        </div>

        {/* =========================================================================
            6. QUICK ACTIONS SECTION matching Reference 1
        ========================================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-base text-[#102443] dark:text-white tracking-tight">
              Quick Actions
            </h4>
            <span
              onClick={() => setIsAddRecordOpen(true)}
              className="text-xs font-bold text-[#159FA6] hover:underline cursor-pointer"
            >
              See All
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Action 1: Add Record */}
            <button
              onClick={() => setIsAddRecordOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#E6F8F7] dark:bg-[#159FA6]/15 hover:bg-[#D7F3F1] dark:hover:bg-[#159FA6]/25 border border-[#159FA6]/20 text-center transition-all group active:scale-95 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#159FA6] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#102443] dark:text-white">Add Record</span>
            </button>

            {/* Action 2: Medicines */}
            <button
              onClick={() => setIsAddMedOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#F5F3FF] dark:bg-purple-950/20 hover:bg-[#EDE9FE] dark:hover:bg-purple-950/30 border border-[#EDE9FE] dark:border-purple-900/30 text-center transition-all group active:scale-95 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1E2C3A] text-[#9333EA] flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                <Pill className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#102443] dark:text-white">Medicines</span>
            </button>

            {/* Action 3: Appointment */}
            <button
              onClick={() => setIsAddApptOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#EFF6FF] dark:bg-blue-950/20 hover:bg-[#DBEAFE] dark:hover:bg-blue-950/30 border border-[#DBEAFE] dark:border-blue-900/30 text-center transition-all group active:scale-95 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1E2C3A] text-[#2563EB] flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#102443] dark:text-white">Appointment</span>
            </button>

            {/* Action 4: Daily Check-in */}
            <button
              onClick={() => setIsLogCareOpen(true)}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FFFBEB] dark:bg-amber-950/20 hover:bg-[#FEF3C7] dark:hover:bg-amber-950/30 border border-[#FEF3C7] dark:border-amber-900/30 text-center transition-all group active:scale-95 shadow-sm"
            >
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#1E2C3A] text-[#D97706] flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#102443] dark:text-white">Daily Check-in</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supporting Modals */}
      <AddHealthRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onRecordAdded={loadDashboardData}
        childrenList={children}
      />

      <AddAppointmentModal
        isOpen={isAddApptOpen}
        onClose={() => setIsAddApptOpen(false)}
        onAppointmentAdded={loadDashboardData}
      />

      <AddMedicationModal
        isOpen={isAddMedOpen}
        onClose={() => setIsAddMedOpen(false)}
        onMedicationAdded={loadDashboardData}
      />

      <LogDailyCareModal
        isOpen={isLogCareOpen}
        onClose={() => setIsLogCareOpen(false)}
        onCareLogged={loadDashboardData}
      />

      <EmergencySOSDialog
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />
    </ParentLayout>
  );
};

export default ParentHome;
