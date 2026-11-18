import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, ArrowLeft, RefreshCw, Smile, Droplets, Moon, Zap, Pill, Shield,
  MessageCircle, AlertTriangle, TrendingUp, Activity, Footprints, Thermometer,
  Lightbulb, BarChart2, Calendar, Users, Clock, MapPin, User, CheckCircle
} from "lucide-react";
import { HealthData, HealthStatus, calculateHealthStatus, calculateLifestyleScore, HEALTH_TIPS } from "@/types/health";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function StatusBadge({ status }: { status: HealthStatus }) {
  const config = {
    stable: { label: "Stable", emoji: "✅", className: "status-green border" },
    moderate: { label: "Moderate Concern", emoji: "⚠️", className: "status-yellow border" },
    critical: { label: "Needs Attention", emoji: "🚨", className: "status-red border" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
      {config.emoji} {config.label}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${
        warning ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className={`text-sm font-bold mt-0.5 ${warning ? "text-destructive" : "text-foreground"}`}>
          {value}
        </div>
        {note && <div className="text-xs text-muted-foreground mt-0.5">{note}</div>}
      </div>
    </div>
  );
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  iconBg: string;
  children: React.ReactNode;
  status?: HealthStatus;
  fullGrid?: boolean;
}

function SectionCard({ icon, title, iconBg, children, status, fullGrid }: SectionCardProps) {
  return (
    <div
      className={`bg-card rounded-2xl p-5 shadow-card border ${
        status === "critical"
          ? "border-destructive/40"
          : status === "moderate"
          ? "border-amber-200"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="font-bold text-foreground text-sm">{title}</h3>
        </div>
        {status && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              status === "stable" ? "status-green" : status === "moderate" ? "status-yellow" : "status-red"
            }`}
          >
            {status === "stable" ? "Good" : status === "moderate" ? "Watch" : "Alert"}
          </span>
        )}
      </div>
      <div className={`grid gap-2 ${fullGrid ? "grid-cols-1" : "grid-cols-2"}`}>{children}</div>
    </div>
  );
}

function moodLabel(score: number) {
  return ["😟 Very Low", "😕 Low", "😐 Neutral", "🙂 Good", "😊 Excellent"][score - 1] || "—";
}

function painLabel(v: number) {
  if (v === 0) return "No pain";
  if (v <= 2) return "Mild";
  if (v <= 3) return "Moderate";
  return "Severe";
}

function WeeklyBar({ values, label, color }: { values: number[]; label: string; color: string }) {
  const max = Math.max(...values, 1);
  const days = ["M", "T", "W", "T", "F", "S", "Today"];
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-2">{label}</div>
      <div className="flex items-end gap-1 h-14">
        {values.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md transition-all ${
                i === values.length - 1 ? color : `${color} opacity-40`
              }`}
              style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? "4px" : "0" }}
            />
            <span className="text-[10px] text-muted-foreground leading-none">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type TabKey = "overview" | "wellness" | "medications" | "appointments" | "trends" | "tips";

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [data, setData] = useState<HealthData | null>(null);
  const [historicalData, setHistoricalData] = useState<HealthData[]>([]);
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [linkedParentId, setLinkedParentId] = useState<string | null>(null);
  const [isResolvingSOS, setIsResolvingSOS] = useState(false);

  const load = useCallback(async () => {
    let parentId: string | null = null;
    if (user) {
      parentId = await healthService.getLinkedParentId(user.id);
      setLinkedParentId(parentId);
    }

    // Load today's report
    const targetUserId = parentId || user?.id;
    const report = await healthService.getTodayHealthReport(targetUserId);
    if (report) {
      // If we have parentId, load their medications and appointments
      if (parentId) {
        const meds = await healthService.getMedications(parentId);
        const appts = await healthService.getAppointments(parentId);
        report.medications = meds;
        report.appointments = appts;
      }
      setData(report);
    } else {
      setData(null);
    }

    // Load historical reports for real weekly trends
    if (targetUserId) {
      const history = await healthService.getHistoricalHealthReports(targetUserId, 7);
      setHistoricalData(history);
    }

    setRefreshTime(new Date());
  }, [user]);

  useEffect(() => {
    load();

    // Supabase Realtime channel for live synchronization
    const channel = supabase
      .channel("child_dashboard_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "health_reports" },
        () => {
          load();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sos_alerts" },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const handleAcknowledgeSOS = async () => {
    if (!user || !data) return;
    setIsResolvingSOS(true);
    try {
      if (data) {
        setData({ ...data, sosActivated: false });
        if (linkedParentId) {
          await healthService.saveHealthReport(linkedParentId, { ...data, sosActivated: false });
        }
      }
      toast({
        title: "SOS Acknowledged ✅",
        description: "Emergency incident marked as acknowledged.",
      });
    } catch {
      toast({ title: "Note", description: "Updated locally." });
    } finally {
      setIsResolvingSOS(false);
    }
  };

  const status: HealthStatus = data ? calculateHealthStatus(data) : "stable";
  const hasRisks = data && status !== "stable";
  const lifestyleScore = data ? calculateLifestyleScore(data) : 0;

  const riskAlerts: string[] = [];
  if (data) {
    if (data.moodScore <= 2) riskAlerts.push("Low mood detected");
    if (data.stressLevel >= 4) riskAlerts.push("High stress levels");
    if (data.anxietyLevel >= 4) riskAlerts.push("High anxiety");
    if (data.feelingLonely) riskAlerts.push("Feeling lonely");
    if (data.mealsEaten <= 1) riskAlerts.push("Missed meals");
    if (data.waterIntake < 4) riskAlerts.push("Low water intake");
    if (data.sleepHours < 5) riskAlerts.push("Insufficient sleep");
    if (data.painLevel >= 4) riskAlerts.push("High pain reported");
    if (!data.medicationTaken) riskAlerts.push("Medication not taken");
    if (data.hadFall) riskAlerts.push("⚠️ Fall occurred today");
    if (data.needsHelp) riskAlerts.push("Needs assistance");
    if (data.homeHazards) riskAlerts.push("Home hazards noticed");
    if (data.heartRate > 100 || data.heartRate < 50) riskAlerts.push("Abnormal heart rate");
    if (data.temperature > 99.5) riskAlerts.push("Elevated temperature");
    if (data.stepsCount < 1000) riskAlerts.push("Very low step count");
  }

  // Build actual historical arrays from real records
  const buildTrendArray = (getter: (d: HealthData) => number, fallbackToday: number) => {
    if (historicalData.length > 0) {
      const arr = new Array(7).fill(0);
      historicalData.slice(0, 7).reverse().forEach((d, idx) => {
        arr[idx] = getter(d);
      });
      arr[6] = fallbackToday;
      return arr;
    }
    return [0, 0, 0, 0, 0, fallbackToday, fallbackToday];
  };

  const moodWeek = data ? buildTrendArray((d) => d.moodScore, data.moodScore) : [0, 0, 0, 0, 0, 3, 3];
  const stepsWeek = data ? buildTrendArray((d) => d.stepsCount, data.stepsCount) : [0, 0, 0, 0, 0, 0, 0];
  const sleepWeek = data ? buildTrendArray((d) => d.sleepHours, data.sleepHours) : [0, 0, 0, 0, 0, 7, 7];
  const hrWeek = data ? buildTrendArray((d) => d.heartRate, data.heartRate) : [0, 0, 0, 0, 0, 72, 72];

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Activity className="w-3.5 h-3.5" /> },
    { key: "wellness", label: "Wellness", icon: <Smile className="w-3.5 h-3.5" /> },
    { key: "medications", label: "Meds", icon: <Pill className="w-3.5 h-3.5" /> },
    { key: "appointments", label: "Appts", icon: <Calendar className="w-3.5 h-3.5" /> },
    { key: "trends", label: "Trends", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: "tips", label: "Tips", icon: <Lightbulb className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-child px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-1.5 text-xs text-white/90 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl transition-colors font-medium"
            >
              <User className="w-3.5 h-3.5" /> Profile Settings
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">Child Dashboard</h1>
                <p className="text-white/70 text-sm">Parent health overview</p>
              </div>
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 text-white text-xs hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 space-y-4">
        {!data && (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
            <div className="text-4xl mb-3">📭</div>
            <h2 className="font-bold text-foreground mb-1">No updates yet</h2>
            <p className="text-muted-foreground text-sm">
              Your parent hasn&apos;t submitted today&apos;s health report yet.
            </p>
            <button
              onClick={load}
              className="mt-4 px-4 py-2 gradient-child text-white rounded-xl text-sm font-semibold"
            >
              Check Again
            </button>
          </div>
        )}

        {data && (
          <>
            {/* SOS Alert */}
            {data.sosActivated && (
              <div className="gradient-sos rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sos">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-7 h-7 text-white flex-shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <div className="text-white font-bold text-lg">🚨 Emergency SOS Activated!</div>
                    <div className="text-white/80 text-sm mt-1">
                      Your parent has triggered an emergency alert. Please contact them immediately.
                    </div>
                  </div>
                </div>
                <button
                  disabled={isResolvingSOS}
                  onClick={handleAcknowledgeSOS}
                  className="px-3 py-1.5 rounded-xl bg-white text-destructive font-semibold text-xs shadow hover:bg-white/90 transition-opacity flex-shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                  Acknowledge
                </button>
              </div>
            )}

            {/* Health Risk Alert */}
            {hasRisks && riskAlerts.length > 0 && (
              <div
                className={`rounded-2xl p-4 border ${
                  status === "critical" ? "status-red" : "status-yellow"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Health Risk Detected — {riskAlerts.length} warning{riskAlerts.length > 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {riskAlerts.map((r) => (
                    <span key={r} className="text-xs px-2 py-0.5 bg-white/50 rounded-full font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Status */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground">Overall Health Status</h2>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated:{" "}
                {new Date(data.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · Refreshed {refreshTime.toLocaleTimeString()}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 bg-muted/40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Lifestyle Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-primary">{lifestyleScore}</div>
                    <div className="text-xs text-muted-foreground mb-0.5">/100</div>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${lifestyleScore}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1 bg-muted/40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Diet Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-accent">{data.dietHabitsScore ?? 50}</div>
                    <div className="text-xs text-muted-foreground mb-0.5">/100</div>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${data.dietHabitsScore ?? 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: data.medicationTaken ? "✅" : "❌", label: "Meds", warn: !data.medicationTaken },
                {
                  emoji: ["😟", "😕", "😐", "🙂", "😊"][data.moodScore - 1],
                  label: `Mood ${data.moodScore}/5`,
                  warn: data.moodScore <= 2,
                },
                { emoji: "😴", label: `${data.sleepHours}h sleep`, warn: data.sleepHours < 5 },
                {
                  emoji: "🚶",
                  label: `${(data.stepsCount / 1000).toFixed(1)}k steps`,
                  warn: data.stepsCount < 1000,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-2.5 text-center border ${
                    s.warn ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                  }`}
                >
                  <div className="text-xl">{s.emoji}</div>
                  <div
                    className={`text-[10px] font-medium mt-0.5 ${
                      s.warn ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tab Navigation */}
            <div className="bg-card rounded-2xl p-1.5 shadow-card border border-border flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? "gradient-child text-white shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ============ OVERVIEW TAB ============ */}
            {activeTab === "overview" && (
              <>
                <SectionCard
                  icon={<Activity className="w-5 h-5 text-white" />}
                  title="Vital Signs"
                  iconBg="bg-cyan-500"
                  status={
                    data.heartRate > 100 || data.heartRate < 50 || data.temperature > 99.5
                      ? "critical"
                      : data.stepsCount < 2000
                      ? "moderate"
                      : "stable"
                  }
                >
                  <MetricCard
                    icon={<Heart className="w-4 h-4 text-rose-500" />}
                    label="Heart Rate"
                    value={`${data.heartRate} bpm`}
                    note="Normal: 60–100 bpm"
                    warning={data.heartRate > 100 || data.heartRate < 50}
                  />
                  <MetricCard
                    icon={<Thermometer className="w-4 h-4 text-amber-500" />}
                    label="Temperature"
                    value={`${data.temperature}°F`}
                    note="Normal: 97–99°F"
                    warning={data.temperature > 99.5}
                  />
                  <MetricCard
                    icon={<Footprints className="w-4 h-4 text-cyan-500" />}
                    label="Steps Today"
                    value={data.stepsCount.toLocaleString()}
                    note={`Goal: 8,000 (${Math.round((data.stepsCount / 8000) * 100)}%)`}
                    warning={data.stepsCount < 1000}
                  />
                  <MetricCard
                    icon={<Zap className="w-4 h-4 text-emerald-500" />}
                    label="Calories Burned"
                    value={`${data.activeCalories} kcal`}
                    note={`${data.distanceKm} km walked`}
                  />
                </SectionCard>

                {/* Safety & Living */}
                <SectionCard
                  icon={<Shield className="w-5 h-5 text-white" />}
                  title="Safety & Daily Living"
                  iconBg="bg-rose-400"
                  status={data.hadFall || data.needsHelp ? "critical" : !data.feltSafe ? "moderate" : "stable"}
                >
                  <MetricCard
                    icon={<Shield className="w-4 h-4 text-rose-500" />}
                    label="Felt Safe at Home"
                    value={data.feltSafe ? "Yes, safe" : "Felt unsafe"}
                    warning={!data.feltSafe}
                  />
                  <MetricCard
                    icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
                    label="Fall Incident"
                    value={data.hadFall ? "⚠️ Fall reported!" : "No falls"}
                    warning={data.hadFall}
                  />
                  <MetricCard
                    icon={<MapPin className="w-4 h-4 text-amber-500" />}
                    label="Home Hazards"
                    value={data.homeHazards ? "Hazards noticed" : "No hazards"}
                    warning={data.homeHazards}
                  />
                  <MetricCard
                    icon={<Users className="w-4 h-4 text-primary" />}
                    label="Needs Assistance"
                    value={data.needsHelp ? "Needs help" : "Managing well"}
                    warning={data.needsHelp}
                  />
                </SectionCard>

                {/* Bonding Message */}
                {data.bondingMessage && (
                  <div className="bg-card rounded-2xl p-5 shadow-card border border-pink-200 dark:border-pink-900">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-5 h-5 text-pink-500" />
                      <h3 className="font-bold text-foreground text-sm">Today&apos;s Message from Parent</h3>
                    </div>
                    <p className="text-sm text-foreground bg-pink-50 dark:bg-pink-950/20 rounded-xl p-3 border border-pink-100 dark:border-pink-900/40 italic">
                      &quot;{data.bondingMessage}&quot;
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ============ WELLNESS TAB ============ */}
            {activeTab === "wellness" && (
              <>
                <SectionCard
                  icon={<Smile className="w-5 h-5 text-white" />}
                  title="Mental & Emotional"
                  iconBg="bg-violet-400"
                  status={data.moodScore <= 2 || data.stressLevel >= 4 ? "critical" : "stable"}
                >
                  <MetricCard
                    icon={<Smile className="w-4 h-4 text-violet-500" />}
                    label="Mood"
                    value={moodLabel(data.moodScore)}
                    warning={data.moodScore <= 2}
                  />
                  <MetricCard
                    icon={<Activity className="w-4 h-4 text-amber-500" />}
                    label="Stress Level"
                    value={`${data.stressLevel}/5`}
                    warning={data.stressLevel >= 4}
                  />
                  <MetricCard
                    icon={<Zap className="w-4 h-4 text-indigo-500" />}
                    label="Anxiety Level"
                    value={`${data.anxietyLevel}/5`}
                    warning={data.anxietyLevel >= 4}
                  />
                  <MetricCard
                    icon={<Users className="w-4 h-4 text-emerald-500" />}
                    label="Social Connection"
                    value={data.feelingLonely ? "Feeling lonely" : "Connected"}
                    warning={data.feelingLonely}
                  />
                </SectionCard>

                <SectionCard
                  icon={<Moon className="w-5 h-5 text-white" />}
                  title="Sleep & Rest"
                  iconBg="bg-indigo-400"
                  status={data.sleepHours < 5 ? "critical" : data.sleepHours < 6 ? "moderate" : "stable"}
                >
                  <MetricCard
                    icon={<Moon className="w-4 h-4 text-indigo-500" />}
                    label="Sleep Duration"
                    value={`${data.sleepHours} hrs`}
                    note={`Quality: ${data.sleepQuality}/5`}
                    warning={data.sleepHours < 5}
                  />
                  <MetricCard
                    icon={<Clock className="w-4 h-4 text-blue-500" />}
                    label="Schedule"
                    value={`${data.wakeUpTime || "7 AM"}`}
                    note={`Bedtime: ${data.sleepInBedTime || "10 PM"}`}
                  />
                  <MetricCard
                    icon={<Activity className="w-4 h-4 text-purple-500" />}
                    label="Deep Sleep"
                    value={`${data.deepSleepHours}h`}
                    note={`Awake: ${data.awakeDuringNight} min`}
                  />
                  <MetricCard
                    icon={<Smile className="w-4 h-4 text-teal-500" />}
                    label="Felt Rested"
                    value={data.feltRestedAfterSleep ? "Yes, refreshed" : "Tired"}
                    warning={!data.feltRestedAfterSleep}
                  />
                </SectionCard>

                <SectionCard
                  icon={<Droplets className="w-5 h-5 text-white" />}
                  title="Food & Hydration"
                  iconBg="bg-sky-400"
                  status={data.mealsEaten <= 1 || data.waterIntake < 4 ? "moderate" : "stable"}
                >
                  <MetricCard
                    icon={<Droplets className="w-4 h-4 text-sky-500" />}
                    label="Meals Eaten"
                    value={`${data.mealsEaten} of 3 meals`}
                    warning={data.mealsEaten <= 1}
                  />
                  <MetricCard
                    icon={<Droplets className="w-4 h-4 text-blue-500" />}
                    label="Water Intake"
                    value={`${data.waterIntake} cups`}
                    note="Goal: 8 cups"
                    warning={data.waterIntake < 4}
                  />
                  <MetricCard
                    icon={<Activity className="w-4 h-4 text-emerald-500" />}
                    label="Appetite"
                    value={data.appetiteGood ? "Good" : "Poor appetite"}
                    warning={!data.appetiteGood}
                  />
                  <MetricCard
                    icon={<Zap className="w-4 h-4 text-amber-500" />}
                    label="Vitamins & Greens"
                    value={data.hadFruitsVeggies ? "Had fruits/veg" : "None"}
                  />
                </SectionCard>

                <SectionCard
                  icon={<Zap className="w-5 h-5 text-white" />}
                  title="Physical Activity"
                  iconBg="bg-amber-400"
                  status={data.painLevel >= 4 ? "critical" : "stable"}
                >
                  <MetricCard
                    icon={<Activity className="w-4 h-4 text-amber-500" />}
                    label="Mobility Level"
                    value={`${data.mobilityLevel}/5`}
                    warning={data.mobilityLevel <= 2}
                  />
                  <MetricCard
                    icon={<AlertTriangle className="w-4 h-4 text-rose-500" />}
                    label="Pain Level"
                    value={painLabel(data.painLevel)}
                    warning={data.painLevel >= 3}
                  />
                  <MetricCard
                    icon={<Footprints className="w-4 h-4 text-cyan-500" />}
                    label="Exercise Duration"
                    value={`${data.exerciseMinutes} min`}
                  />
                  <MetricCard
                    icon={<Zap className="w-4 h-4 text-emerald-500" />}
                    label="Walking Aid"
                    value={data.usedWalkingAid ? "Used aid" : "Unaided"}
                  />
                </SectionCard>
              </>
            )}

            {/* ============ MEDICATIONS TAB ============ */}
            {activeTab === "medications" && (
              <>
                <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground">Medication Status</h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        data.medicationTaken ? "status-green" : "status-red"
                      }`}
                    >
                      {data.medicationTaken ? "All Taken ✅" : "Missed Dose ⚠️"}
                    </span>
                  </div>

                  {data.medications && data.medications.length > 0 ? (
                    <div className="space-y-2">
                      {data.medications.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border"
                        >
                          <div>
                            <div className="text-sm font-semibold text-foreground">{m.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {m.dose} · {m.time} · {m.frequency}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              m.taken ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {m.taken ? "Taken" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No specific medications logged today.</p>
                  )}
                </div>

                {data.medicationSideEffects && (
                  <div className="bg-card rounded-2xl p-4 shadow-card border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🔔</span>
                      <span className="font-semibold text-sm text-foreground">Side Effects Reported</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{data.medicationSideEffects}</p>
                  </div>
                )}
              </>
            )}

            {/* ============ APPOINTMENTS TAB ============ */}
            {activeTab === "appointments" && (
              <>
                {data.appointments && data.appointments.length > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-foreground">Upcoming Appointments</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.appointments.length} appointment{data.appointments.length > 1 ? "s" : ""} scheduled
                      </p>
                    </div>
                    {data.appointments.map((appt, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-2xl p-4 shadow-card border border-border flex gap-4 items-start"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{appt.title}</div>
                          <div className="text-sm text-muted-foreground">Dr. {appt.doctor}</div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs text-primary font-medium">
                              {appt.date} {appt.time && `· ${appt.time}`}
                            </span>
                          </div>
                          {appt.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <h2 className="font-bold text-foreground mb-1">No appointments</h2>
                    <p className="text-muted-foreground text-sm">
                      Your parent hasn&apos;t added any upcoming appointments yet.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ============ TRENDS TAB ============ */}
            {activeTab === "trends" && (
              <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">Weekly Health Trends</h3>
                </div>
                <p className="text-xs text-muted-foreground -mt-2">Tracking this week&apos;s patterns at a glance</p>

                <WeeklyBar values={moodWeek} label="Mood (1–5)" color="bg-violet-400" />
                <div className="h-px bg-border" />
                <WeeklyBar
                  values={stepsWeek.map((v) => Math.round(v / 100))}
                  label="Steps (hundreds)"
                  color="bg-cyan-500"
                />
                <div className="h-px bg-border" />
                <WeeklyBar values={sleepWeek} label="Sleep Hours" color="bg-indigo-400" />
                <div className="h-px bg-border" />
                <WeeklyBar
                  values={hrWeek.map((v) => Math.round(v / 10))}
                  label="Heart Rate (÷10)"
                  color="bg-rose-400"
                />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Mood</div>
                    <div className="text-lg font-bold text-primary">
                      {(moodWeek.reduce((a, b) => a + b, 0) / (moodWeek.filter((v) => v > 0).length || 1)).toFixed(1)}/5
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Steps</div>
                    <div className="text-lg font-bold text-primary">
                      {Math.round(
                        stepsWeek.reduce((a, b) => a + b, 0) / (stepsWeek.filter((v) => v > 0).length || 1)
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Sleep</div>
                    <div className="text-lg font-bold text-foreground">
                      {(sleepWeek.reduce((a, b) => a + b, 0) / (sleepWeek.filter((v) => v > 0).length || 1)).toFixed(1)}h
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Heart Rate</div>
                    <div className="text-lg font-bold text-destructive">
                      {Math.round(
                        hrWeek.reduce((a, b) => a + b, 0) / (hrWeek.filter((v) => v > 0).length || 1)
                      )} bpm
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============ HEALTH TIPS TAB ============ */}
            {activeTab === "tips" && (
              <div className="space-y-3">
                <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-bold text-foreground">Daily Health Tips</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Helpful reminders to share with your parent 💙</p>
                </div>
                {HEALTH_TIPS.map((tip, i) => (
                  <div
                    key={i}
                    className="bg-card rounded-2xl p-4 shadow-card border border-border flex gap-3 items-start"
                  >
                    <div className="text-2xl flex-shrink-0">{tip.emoji}</div>
                    <p className="text-sm text-foreground leading-relaxed">{tip.tip}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildDashboard;
