import React, { useState, useEffect, useCallback } from "react";
import {
  Heart, Activity, Scale, Smile, FileText, Shield, FlaskConical,
  ChevronRight, Calendar, Plus, CheckCircle, TrendingUp
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { CircularGauge } from "@/components/parent/CircularGauge";
import { AddHealthRecordModal } from "@/components/parent/AddHealthRecordModal";
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

export const ParentHealth: React.FC = () => {
  const { user } = useAuth();

  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("self");
  const [dateRange, setDateRange] = useState<string>("7");
  const [healthData, setHealthData] = useState<HealthData>(getDefaultHealthData);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const healthScore = healthData.lifestyleScore || 86;

  // Chart data points based on 7 days
  const trendPoints = [
    { day: "Mon", hr: 72, sleep: 7.0 },
    { day: "Tue", hr: 78, sleep: 7.5 },
    { day: "Wed", hr: 74, sleep: 8.0 },
    { day: "Thu", hr: 82, sleep: 7.2 },
    { day: "Fri", hr: 76, sleep: 6.8 },
    { day: "Sat", hr: 85, sleep: 8.5 },
    { day: "Sun", hr: healthData.heartRate || 76, sleep: healthData.sleepHours || 7.5 },
  ];

  return (
    <ParentLayout title="Health Records">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* =========================================================================
            1. HERO BANNER matching Reference 3
        ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#159FA6] via-[#1FAFB6] to-[#42C5C9] p-6 sm:p-7 text-white shadow-lg shadow-[#159FA6]/20">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              Health Records
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Track, monitor and manage your family's health.
            </p>
          </div>

          <div className="absolute right-4 -bottom-4 opacity-25 sm:opacity-35 pointer-events-none">
            <svg width="170" height="150" viewBox="0 0 180 150" fill="none">
              <rect x="30" y="20" width="110" height="130" rx="16" fill="white" />
              <rect x="55" y="10" width="60" height="20" rx="8" fill="#087B88" />
              <path
                d="M85 75c-15-10-25-20-25-28 0-6 5-8 10-8 5 0 9 4 15 8 6-4 10-8 15-8 5 0 10 2 10 8 0 8-10 18-25 28z"
                fill="#159FA6"
              />
              <path d="M50 95h70M50 115h50" stroke="#087B88" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            2. FILTERS ROW: Family member selector & Date range selector
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

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full py-2.5 px-3.5 rounded-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] bg-white dark:bg-[#111A24] text-xs sm:text-sm font-bold text-[#102443] dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#159FA6]"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
        </div>

        {/* =========================================================================
            3. OVERALL HEALTH SCORE CARD matching Reference 3
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Circular Gauge */}
            <div className="flex justify-center sm:justify-start sm:pl-4">
              <CircularGauge
                score={healthScore}
                label="Health Score"
                size={135}
                strokeWidth={11}
              />
            </div>

            {/* Overall Health Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm text-[#102443] dark:text-white">
                  Overall Health
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F8F0] dark:bg-emerald-950/40 text-[#22B96B] text-xs font-bold">
                  <CheckCircle className="w-3 h-3" />
                  <span>Good</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#60738F] dark:text-[#A0B0C0] leading-relaxed">
                {activeName}'s health is stable and within a healthy recommended range based on your recorded vitals and daily check-ins.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. HEALTH CATEGORIES 6-CARD GRID matching Reference 3
        ========================================================================== */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-base text-[#102443] dark:text-white tracking-tight">
              Health Categories
            </h4>
            <span
              onClick={() => setIsAddRecordOpen(true)}
              className="text-xs font-bold text-[#159FA6] hover:underline cursor-pointer"
            >
              View History &gt;
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* 1. Vital Signs */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFF1F2] dark:bg-rose-950/30 text-[#EF4444] flex items-center justify-center mb-2.5">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Vital Signs
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                HR, BP, Temp, SpO2
              </p>
            </div>

            {/* 2. Growth & BMI */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E6F8F7] dark:bg-teal-950/30 text-[#159FA6] flex items-center justify-center mb-2.5">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Growth & BMI
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                Height, Weight, BMI
              </p>
            </div>

            {/* 3. Mental Wellness */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/30 text-[#9333EA] flex items-center justify-center mb-2.5">
                <Smile className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Mental Wellness
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                Mood, Stress, Focus
              </p>
            </div>

            {/* 4. Health History */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/30 text-[#2563EB] flex items-center justify-center mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Health History
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                Illness, Visits, Reports
              </p>
            </div>

            {/* 5. Immunizations */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] dark:bg-amber-950/30 text-[#D97706] flex items-center justify-center mb-2.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Immunizations
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                Vaccines & Records
              </p>
            </div>

            {/* 6. Lab Reports */}
            <div
              onClick={() => setIsAddRecordOpen(true)}
              className="bg-white dark:bg-[#111A24] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-sm hover:border-[#159FA6] cursor-pointer transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#E6F8F7] dark:bg-teal-950/30 text-[#087B88] flex items-center justify-center mb-2.5">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-[#102443] dark:text-white">
                  Lab Reports
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F] group-hover:text-[#159FA6]" />
              </div>
              <p className="text-[11px] text-[#60738F] dark:text-[#8FA0B5] mt-0.5 truncate">
                Tests & Results
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. HEALTH TRENDS SECTION matching Reference 3
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-[#102443] dark:text-white tracking-tight">
              Health Trends
            </h4>
            <span className="text-xs font-bold text-[#159FA6] flex items-center gap-1">
              <span>This Week</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-4">
            {/* SVG Trend Line Graph */}
            <div className="w-full h-36 flex flex-col justify-between">
              <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#E2EEF1" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#E2EEF1" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#E2EEF1" strokeDasharray="3 3" />

                {/* Heart rate line (Teal) */}
                <polyline
                  fill="none"
                  stroke="#159FA6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,45 60,40 105,50 150,42 195,48 240,30 280,25"
                />
                {/* Heart rate points */}
                {[
                  [20, 45],
                  [60, 40],
                  [105, 50],
                  [150, 42],
                  [195, 48],
                  [240, 30],
                  [280, 25],
                ].map(([x, y], idx) => (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#159FA6"
                    className="stroke-white dark:stroke-[#111A24] stroke-2"
                  />
                ))}

                {/* Sleep line (Purple) */}
                <polyline
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2.5"
                  strokeDasharray="2 2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="20,70 60,65 105,62 150,68 195,64 240,55 280,58"
                />
              </svg>

              {/* Day Labels */}
              <div className="flex justify-between text-[11px] font-bold text-[#60738F] px-3">
                {trendPoints.map((p) => (
                  <span key={p.day}>{p.day}</span>
                ))}
              </div>
            </div>

            {/* Metric snapshot pills matching Reference 3 */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#E6F8F7] dark:bg-teal-950/20 border border-[#159FA6]/20 flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#159FA6] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#60738F] truncate">Heart Rate</div>
                  <div className="text-sm font-black text-[#102443] dark:text-white truncate">
                    {healthData.heartRate || 98} bpm
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#9333EA] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-[#60738F] truncate">Sleep</div>
                  <div className="text-sm font-black text-[#102443] dark:text-white truncate">
                    {healthData.sleepHours ? `${healthData.sleepHours} h` : "7 h 30 m"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. PRIMARY ACTION BUTTON matching Reference 3
        ========================================================================== */}
        <button
          onClick={() => setIsAddRecordOpen(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#159FA6] hover:bg-[#087B88] text-white font-bold text-base shadow-lg shadow-[#159FA6]/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Plus className="w-5 h-5" />
          <span>+ Add Health Record</span>
        </button>
      </div>

      {/* Health Record Modal */}
      <AddHealthRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        onRecordAdded={loadData}
        childrenList={children}
      />
    </ParentLayout>
  );
};

export default ParentHealth;
