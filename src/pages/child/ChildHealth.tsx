import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Calendar,
  ChevronRight,
  Plus,
  Activity,
  Ruler,
  Brain,
  History,
  ShieldCheck,
  FileText,
  CheckCircle,
  Moon,
  TrendingUp,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildCircularGauge } from "@/components/child/ChildCircularGauge";
import { ChildAddHealthRecordModal } from "@/components/child/ChildAddHealthRecordModal";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData } from "@/types/health";
import { useToast } from "@/hooks/use-toast";

export const ChildHealth: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [todayHealth, setTodayHealth] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<HealthData[]>([]);
  const [trendTab, setTrendTab] = useState<"week" | "month" | "year">("week");
  const [dateFilter, setDateFilter] = useState("7days");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const childName = profile?.full_name?.split(" ")[0] || "Arjun";

  const loadHealth = useCallback(async () => {
    if (!user) return;
    try {
      const parentId = await healthService.getLinkedParentId(user.id);
      const targetId = parentId || user.id;

      const report = await healthService.getTodayHealthReport(targetId);
      setTodayHealth(report);

      const days = dateFilter === "30days" ? 30 : 7;
      const reports = await healthService.getHistoricalHealthReports(targetId, days);
      setHistory(reports);
    } catch (err) {
      console.warn("ChildHealth load error:", err);
    }
  }, [user, dateFilter]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const score = todayHealth?.lifestyleScore ?? 86;
  const hr = todayHealth?.heartRate ?? 98;
  const sleep = todayHealth?.sleepHours ?? 7.5;

  const handleCategoryClick = (catName: string, desc: string) => {
    setSelectedCategory(catName);
    toast({
      title: `${catName} 📋`,
      description: desc,
    });
  };

  // Mock points for trend lines based on history
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hrTrendValues = [72, 75, 71, 76, 74, 82, hr];
  const sleepTrendValues = [7, 7.5, 6.8, 7.2, 8, 8.5, sleep];

  return (
    <ChildLayout
      title="My Health"
      currentVitals={{
        heartRate: todayHealth?.heartRate,
        temperature: todayHealth?.temperature,
      }}
    >
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 2 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight mb-1">
                My Health
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                Track your health records, growth and overall well-being.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <FileText className="w-8 h-8 text-white fill-white/20" />
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

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white focus:outline-none"
          >
            <option value="7days">📅 Last 7 Days</option>
            <option value="14days">📅 Last 14 Days</option>
            <option value="30days">📅 Last 30 Days</option>
          </select>
        </div>

        {/* SECTION A: OVERALL HEALTH SUMMARY */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between gap-4">
            <ChildCircularGauge
              score={score}
              label="Health Score"
              size={120}
              strokeWidth={10}
            />

            <div className="flex-1 pr-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black text-[#172443] dark:text-white">
                  Overall Health
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#22B96B]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Good</span>
                </span>
              </div>
              <p className="text-xs text-[#64718B] dark:text-[#A0B0C0] leading-relaxed">
                Your health is stable and within a healthy range.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION B: HEALTH CATEGORIES */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-black text-[#172443] dark:text-white">
              Health Categories
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-[#8960D0] hover:underline flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Vital Signs */}
            <div
              onClick={() => handleCategoryClick("Vital Signs", "Heart rate: 76 bpm, Temp: 98.4°F, BP: Normal")}
              className="p-3.5 rounded-2xl bg-[#FFEBF0] dark:bg-pink-950/20 text-[#D83A6F] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Heart className="w-5 h-5 text-[#D83A6F]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Vital Signs
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                HR, BP, Temp, SpO2
              </div>
            </div>

            {/* 2. Growth & BMI */}
            <div
              onClick={() => handleCategoryClick("Growth & BMI", "Height: 142 cm, Weight: 36 kg. BMI is normal for age 10-13.")}
              className="p-3.5 rounded-2xl bg-[#E8F4FD] dark:bg-blue-950/20 text-[#2980B9] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Ruler className="w-5 h-5 text-[#2980B9]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Growth & BMI
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                Height, Weight, BMI
              </div>
            </div>

            {/* 3. Mental Wellness */}
            <div
              onClick={() => handleCategoryClick("Mental Wellness", "Current mood: Good (4/5). Stress level: Low.")}
              className="p-3.5 rounded-2xl bg-[#F0EAFE] dark:bg-purple-950/20 text-[#8960D0] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Brain className="w-5 h-5 text-[#8960D0]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Mental Wellness
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                Mood, Stress, Focus
              </div>
            </div>

            {/* 4. Health History */}
            <div
              onClick={() => handleCategoryClick("Health History", "Review previous check-ins and parental health logs.")}
              className="p-3.5 rounded-2xl bg-[#E8F8F5] dark:bg-emerald-950/20 text-[#1ABC9C] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <History className="w-5 h-5 text-[#1ABC9C]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Health History
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                Records & Visits
              </div>
            </div>

            {/* 5. Immunizations */}
            <div
              onClick={() => handleCategoryClick("Immunizations", "Child immunization schedule is up to date (Managed by parent).")}
              className="p-3.5 rounded-2xl bg-[#FFF4E6] dark:bg-orange-950/20 text-[#E67E22] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <ShieldCheck className="w-5 h-5 text-[#E67E22]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Immunizations
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                Vaccines & Doses
              </div>
            </div>

            {/* 6. Lab Reports */}
            <div
              onClick={() => handleCategoryClick("Lab Reports", "Annual pediatric routine wellness panel: All clear.")}
              className="p-3.5 rounded-2xl bg-[#F4EFFE] dark:bg-indigo-950/20 text-[#7D3C98] cursor-pointer hover:scale-102 transition-transform"
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileText className="w-5 h-5 text-[#7D3C98]" />
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs font-bold text-[#172443] dark:text-white">
                Lab Reports
              </div>
              <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate mt-0.5">
                Tests & Results
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: HEALTH TRENDS CHART */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-[#172443] dark:text-white">
              Health Trends
            </h2>
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#F6F7FC] dark:bg-[#1B2836]">
              {(["week", "month", "year"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrendTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    trendTab === t
                      ? "bg-[#8960D0] text-white shadow-sm"
                      : "text-[#64718B] hover:text-[#172443]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div className="space-y-3">
            <div className="h-32 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 350 120" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="20" x2="350" y2="20" stroke="#F0EAFE" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="350" y2="60" stroke="#F0EAFE" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="350" y2="100" stroke="#F0EAFE" strokeDasharray="3 3" />

                {/* Heart Rate Line (Purple) */}
                <path
                  d="M 10 70 Q 60 65 110 75 T 210 60 T 310 45"
                  fill="none"
                  stroke="#8960D0"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Heart Rate Points */}
                <circle cx="10" cy="70" r="4" fill="#8960D0" />
                <circle cx="60" cy="65" r="4" fill="#8960D0" />
                <circle cx="110" cy="75" r="4" fill="#8960D0" />
                <circle cx="160" cy="70" r="4" fill="#8960D0" />
                <circle cx="210" cy="60" r="4" fill="#8960D0" />
                <circle cx="260" cy="50" r="4" fill="#8960D0" />
                <circle cx="310" cy="45" r="4" fill="#8960D0" />

                {/* Sleep / Vitals Line (Blue) */}
                <path
                  d="M 10 95 Q 60 90 110 98 T 210 88 T 310 75"
                  fill="none"
                  stroke="#5369D7"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="10" cy="95" r="4" fill="#5369D7" />
                <circle cx="60" cy="90" r="4" fill="#5369D7" />
                <circle cx="110" cy="98" r="4" fill="#5369D7" />
                <circle cx="160" cy="92" r="4" fill="#5369D7" />
                <circle cx="210" cy="88" r="4" fill="#5369D7" />
                <circle cx="260" cy="80" r="4" fill="#5369D7" />
                <circle cx="310" cy="75" r="4" fill="#5369D7" />
              </svg>
            </div>

            {/* X-axis days */}
            <div className="flex justify-between px-2 text-[10px] text-[#64718B] font-bold">
              {weekDays.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#F0EAFE] dark:bg-purple-950/20">
                <Heart className="w-5 h-5 text-[#8960D0]" />
                <div>
                  <div className="text-[10px] text-[#64718B] font-medium leading-none">
                    Heart Rate
                  </div>
                  <div className="text-xs font-black text-[#172443] dark:text-white mt-1">
                    {hr} bpm
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#E8F4FD] dark:bg-blue-950/20">
                <Moon className="w-5 h-5 text-[#5369D7]" />
                <div>
                  <div className="text-[10px] text-[#64718B] font-medium leading-none">
                    Sleep
                  </div>
                  <div className="text-xs font-black text-[#172443] dark:text-white mt-1">
                    {sleep} h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA: + Add Health Record */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white font-bold text-sm shadow-md shadow-[#5369D7]/25 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Health Record</span>
        </button>
      </div>

      <ChildAddHealthRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadHealth}
      />
    </ChildLayout>
  );
};

export default ChildHealth;
