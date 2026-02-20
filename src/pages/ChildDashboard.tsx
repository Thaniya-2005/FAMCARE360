import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, ArrowLeft, RefreshCw, Smile, Droplets, Moon, Zap, Pill, Shield,
  MessageCircle, AlertTriangle, TrendingUp, Activity, Footprints, Thermometer,
  Lightbulb, BarChart2, Calendar, Users, Clock, MapPin
} from "lucide-react";
import { HealthData, HealthStatus, calculateHealthStatus, calculateLifestyleScore, HEALTH_TIPS } from "@/types/health";

const STORAGE_KEY = "famcare360_health_data";

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

function MetricCard({ icon, label, value, note, warning }: {
  icon: React.ReactNode; label: string; value: string; note?: string; warning?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${warning ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"}`}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        <div className={`text-sm font-bold mt-0.5 ${warning ? "text-destructive" : "text-foreground"}`}>{value}</div>
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
    <div className={`bg-card rounded-2xl p-5 shadow-card border ${status === "critical" ? "border-destructive/40" : status === "moderate" ? "border-amber-200" : "border-border"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <h3 className="font-bold text-foreground text-sm">{title}</h3>
        </div>
        {status && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            status === "stable" ? "status-green" : status === "moderate" ? "status-yellow" : "status-red"
          }`}>
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
              className={`w-full rounded-t-md transition-all ${i === values.length - 1 ? color : `${color} opacity-40`}`}
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
  const [data, setData] = useState<HealthData | null>(null);
  const [refreshTime, setRefreshTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const load = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    }
    setRefreshTime(new Date());
  };

  useEffect(() => { load(); }, []);

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

  const moodWeek = data ? [3, 4, 2, 4, 5, data.moodScore, data.moodScore] : [3, 4, 2, 4, 5, 3, 3];
  const stepsWeek = data ? [4200, 6500, 3000, 7200, 5500, data.stepsCount, data.stepsCount] : [4200, 6500, 3000, 7200, 5500, 0, 0];
  const sleepWeek = data ? [6, 7, 5, 8, 7, data.sleepHours, data.sleepHours] : [6, 7, 5, 8, 7, 7, 7];
  const hrWeek = data ? [75, 72, 80, 68, 73, data.heartRate, data.heartRate] : [75, 72, 80, 68, 73, 72, 72];

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
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
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
            <button onClick={load} className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2 text-white text-xs hover:bg-white/30 transition-colors">
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
            <p className="text-muted-foreground text-sm">Your parent hasn't submitted today's health report yet.</p>
            <button onClick={load} className="mt-4 px-4 py-2 gradient-child text-white rounded-xl text-sm font-semibold">
              Check Again
            </button>
          </div>
        )}

        {data && (
          <>
            {/* SOS Alert */}
            {data.sosActivated && (
              <div className="gradient-sos rounded-2xl p-5 flex items-start gap-4 shadow-sos">
                <AlertTriangle className="w-7 h-7 text-white flex-shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <div className="text-white font-bold text-lg">🚨 Emergency SOS Activated!</div>
                  <div className="text-white/80 text-sm mt-1">Your parent has activated an emergency alert. Please contact them immediately or call for help.</div>
                </div>
              </div>
            )}

            {/* Health Risk Alert */}
            {hasRisks && riskAlerts.length > 0 && (
              <div className={`rounded-2xl p-4 border ${status === "critical" ? "status-red" : "status-yellow"}`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Health Risk Detected — {riskAlerts.length} warning{riskAlerts.length > 1 ? "s" : ""}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {riskAlerts.map(r => (
                    <span key={r} className="text-xs px-2 py-0.5 bg-white/50 rounded-full font-medium">{r}</span>
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
                Last updated: {new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Refreshed {refreshTime.toLocaleTimeString()}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 bg-muted/40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Lifestyle Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-primary">{lifestyleScore}</div>
                    <div className="text-xs text-muted-foreground mb-0.5">/100</div>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${lifestyleScore}%` }} />
                  </div>
                </div>
                <div className="flex-1 bg-muted/40 rounded-xl p-3">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Diet Score</div>
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold text-accent">{data.dietHabitsScore ?? 50}</div>
                    <div className="text-xs text-muted-foreground mb-0.5">/100</div>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${data.dietHabitsScore ?? 50}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { emoji: data.medicationTaken ? "✅" : "❌", label: "Meds", warn: !data.medicationTaken },
                { emoji: ["😟","😕","😐","🙂","😊"][data.moodScore-1], label: `Mood ${data.moodScore}/5`, warn: data.moodScore <= 2 },
                { emoji: "😴", label: `${data.sleepHours}h sleep`, warn: data.sleepHours < 5 },
                { emoji: "🚶", label: `${(data.stepsCount/1000).toFixed(1)}k steps`, warn: data.stepsCount < 1000 },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-2.5 text-center border ${s.warn ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
                  <div className="text-xl">{s.emoji}</div>
                  <div className={`text-[10px] font-medium mt-0.5 ${s.warn ? "text-destructive" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tab Navigation — scrollable */}
            <div className="bg-card rounded-2xl p-1.5 shadow-card border border-border flex gap-1 overflow-x-auto">
              {tabs.map(tab => (
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
                {/* Vitals */}
                <SectionCard
                  icon={<Activity className="w-5 h-5 text-white" />}
                  title="Vital Signs"
                  iconBg="bg-cyan-500"
                  status={data.heartRate > 100 || data.heartRate < 50 || data.temperature > 99.5 ? "critical" : data.stepsCount < 2000 ? "moderate" : "stable"}
                >
                  <MetricCard icon={<Heart className="w-4 h-4 text-destructive" />} label="Heart Rate" value={`${data.heartRate} bpm`} warning={data.heartRate > 100 || data.heartRate < 50} note={data.heartRate > 100 ? "Above normal" : data.heartRate < 50 ? "Below normal" : "Normal range"} />
                  <MetricCard icon={<Thermometer className="w-4 h-4 text-accent" />} label="Temperature" value={`${data.temperature}°F`} warning={data.temperature > 99.5 || data.temperature < 97} note={data.temperature > 99.5 ? "Elevated" : "Normal"} />
                  <MetricCard icon={<MapPin className="w-4 h-4 text-primary" />} label="Distance" value={`${data.distanceKm ?? 0} km`} />
                  <MetricCard icon={<Activity className="w-4 h-4 text-amber-500" />} label="Active Calories" value={`${data.activeCalories ?? 0} kcal`} />
                  <div className="col-span-2 bg-muted/30 rounded-xl p-3 flex items-center gap-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                          strokeDasharray={`${Math.min((data.stepsCount / 8000) * 100, 100)} 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Footprints className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{data.stepsCount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">steps today · Goal 8,000</div>
                      <div className={`text-xs font-medium mt-0.5 ${data.stepsCount >= 8000 ? "text-primary" : data.stepsCount < 2000 ? "text-destructive" : "text-amber-500"}`}>
                        {Math.round((data.stepsCount / 8000) * 100)}% of daily goal
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Bonding Message */}
                {data.bondingMessage && (
                  <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-accent" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm">Message from Parent 💙</h3>
                    </div>
                    <blockquote className="text-foreground text-sm leading-relaxed bg-accent/5 border border-accent/20 rounded-xl p-4 italic">
                      "{data.bondingMessage}"
                    </blockquote>
                  </div>
                )}

                {/* Caregiver Notes */}
                {data.caregiverNotes && (
                  <div className="bg-card rounded-2xl p-4 shadow-card border border-border flex gap-3 items-start">
                    <Users className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-foreground mb-1">Notes for Family</div>
                      <p className="text-sm text-muted-foreground">{data.caregiverNotes}</p>
                    </div>
                  </div>
                )}

                {/* Safety */}
                <SectionCard icon={<Shield className="w-5 h-5 text-white" />} title="Overall Safety" iconBg="bg-rose-400" status={data.hadFall || !data.feltSafe ? "critical" : data.needsHelp || data.homeHazards ? "moderate" : "stable"}>
                  <MetricCard icon={<span className="text-lg">{data.feltSafe ? "🏠" : "⚠️"}</span>} label="Feeling safe" value={data.feltSafe ? "Yes" : "No"} warning={!data.feltSafe} />
                  <MetricCard icon={<span className="text-lg">{data.hadFall ? "🚨" : "✅"}</span>} label="Had a fall" value={data.hadFall ? "YES - FELL" : "No fall"} warning={data.hadFall} />
                  <MetricCard icon={<span className="text-lg">{data.needsHelp ? "🙏" : "✅"}</span>} label="Needs help" value={data.needsHelp ? "Yes" : "No"} warning={data.needsHelp} />
                  <MetricCard icon={<span className="text-lg">{data.homeHazards ? "⚠️" : "✅"}</span>} label="Home hazards" value={data.homeHazards ? "Reported" : "None"} warning={data.homeHazards} />
                  <MetricCard icon={<span className="text-lg">{data.usedWalkingAid ? "🦯" : "🚶"}</span>} label="Walking aid" value={data.usedWalkingAid ? "Used" : "Not needed"} />
                </SectionCard>
              </>
            )}

            {/* ============ WELLNESS TAB ============ */}
            {activeTab === "wellness" && (
              <>
                {/* Mental & Emotional */}
                <SectionCard icon={<Smile className="w-5 h-5 text-white" />} title="Mental & Emotional Well-being" iconBg="bg-violet-400" status={data.moodScore <= 2 || data.stressLevel >= 4 || data.anxietyLevel >= 4 ? (data.moodScore === 1 ? "critical" : "moderate") : "stable"}>
                  <MetricCard icon={<span className="text-lg">{["😟","😕","😐","🙂","😊"][data.moodScore-1]}</span>} label="Mood" value={moodLabel(data.moodScore)} warning={data.moodScore <= 2} />
                  <MetricCard icon={<span className="text-lg">{data.stressLevel >= 4 ? "😰" : "😌"}</span>} label="Stress" value={`${data.stressLevel}/5`} warning={data.stressLevel >= 4} />
                  <MetricCard icon={<span className="text-lg">{data.anxietyLevel >= 4 ? "😟" : "🧘"}</span>} label="Anxiety" value={`${data.anxietyLevel}/5`} warning={data.anxietyLevel >= 4} />
                  <MetricCard icon={<span className="text-lg">{data.hadSocialInteractions ? "👥" : "🔇"}</span>} label="Social" value={data.hadSocialInteractions ? "Interacted" : "Isolated"} warning={!data.hadSocialInteractions} />
                  <MetricCard icon={<span className="text-lg">{data.feelingLonely ? "💔" : "💙"}</span>} label="Loneliness" value={data.feelingLonely ? "Feeling lonely" : "Feeling connected"} warning={data.feelingLonely} />
                  <MetricCard icon={<span className="text-lg">🌿</span>} label="Outdoor Time" value={`${data.outdoorTimeMinutes ?? 0} min`} />
                  {data.emotionalNotes && (
                    <div className="col-span-2 bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground italic">
                      "{data.emotionalNotes}"
                    </div>
                  )}
                </SectionCard>

                {/* Food & Hydration */}
                <SectionCard icon={<Droplets className="w-5 h-5 text-white" />} title="Food & Hydration" iconBg="bg-sky-400" status={data.mealsEaten <= 1 || data.waterIntake < 4 ? "moderate" : "stable"}>
                  <MetricCard icon={<span className="text-lg">🍽️</span>} label="Meals eaten" value={`${data.mealsEaten}/3 meals`} warning={data.mealsEaten <= 1} />
                  <MetricCard icon={<span className="text-lg">💧</span>} label="Water intake" value={`${data.waterIntake} cups`} warning={data.waterIntake < 4} />
                  <MetricCard icon={<span className="text-lg">{data.ateBreakfast ? "✅" : "❌"}</span>} label="Breakfast" value={data.ateBreakfast ? "Eaten" : "Skipped"} warning={!data.ateBreakfast} />
                  <MetricCard icon={<span className="text-lg">{data.ateLunch ? "✅" : "❌"}</span>} label="Lunch" value={data.ateLunch ? "Eaten" : "Skipped"} warning={!data.ateLunch} />
                  <MetricCard icon={<span className="text-lg">{data.ateDinner ? "✅" : "❌"}</span>} label="Dinner" value={data.ateDinner ? "Eaten" : "Skipped"} warning={!data.ateDinner} />
                  <MetricCard icon={<span className="text-lg">☕</span>} label="Caffeine" value={`${data.caffeineIntake ?? 0} cups`} />
                  <MetricCard icon={<span className="text-lg">{data.hadFruitsVeggies ? "🥦" : "❌"}</span>} label="Fruits & Veg" value={data.hadFruitsVeggies ? "Had some" : "None today"} warning={!data.hadFruitsVeggies} />
                  <MetricCard icon={<span className="text-lg">{data.tookVitamins ? "💊" : "—"}</span>} label="Vitamins" value={data.tookVitamins ? "Taken" : "Not taken"} />
                  <MetricCard icon={<span className="text-lg">{data.appetiteGood ? "✅" : "❌"}</span>} label="Appetite" value={data.appetiteGood ? "Good" : "Poor"} warning={!data.appetiteGood} />
                  <MetricCard icon={<span className="text-lg">🥗</span>} label="Diet Score" value={`${data.dietHabitsScore ?? 50}/100`} warning={(data.dietHabitsScore ?? 50) < 40} />
                </SectionCard>

                {/* Sleep */}
                <SectionCard icon={<Moon className="w-5 h-5 text-white" />} title="Sleep & Rest" iconBg="bg-indigo-400" status={data.sleepHours < 5 || data.sleepQuality <= 2 ? (data.sleepHours < 4 ? "critical" : "moderate") : "stable"} fullGrid>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCard icon={<span className="text-lg">🌙</span>} label="Sleep duration" value={`${data.sleepHours} hours`} warning={data.sleepHours < 5} />
                    <MetricCard icon={<span className="text-lg">{["😴","😴","😐","😊","⭐"][data.sleepQuality-1]}</span>} label="Sleep quality" value={`${data.sleepQuality}/5`} warning={data.sleepQuality <= 2} />
                    <MetricCard icon={<span className="text-lg">⏰</span>} label="Wake Up" value={data.wakeUpTime || "Not set"} />
                    <MetricCard icon={<span className="text-lg">🛌</span>} label="Bedtime" value={data.sleepInBedTime || "Not set"} />
                    <MetricCard icon={<span className="text-lg">{data.feltRestedAfterSleep ? "✅" : "❌"}</span>} label="Felt rested?" value={data.feltRestedAfterSleep ? "Yes" : "No"} warning={!data.feltRestedAfterSleep} />
                    <MetricCard icon={<span className="text-lg">{data.snoringConcerns ? "⚠️" : "✅"}</span>} label="Snoring?" value={data.snoringConcerns ? "Reported" : "No concerns"} warning={data.snoringConcerns} />
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-2">Sleep Breakdown</div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-primary font-medium">Deep Sleep</span>
                        <span className="font-bold">{data.deepSleepHours ?? 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Light Sleep</span>
                        <span className="font-bold">{data.lightSleepHours ?? 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-accent font-medium">REM</span>
                        <span className="font-bold">{data.remSleepHours ?? 0}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Awake</span>
                        <span className="font-bold">{data.awakeDuringNight ?? 0}m</span>
                      </div>
                    </div>
                  </div>
                  <MetricCard icon={<span className="text-lg">☀️</span>} label="Daytime nap" value={data.hadNap ? "Yes" : "No"} />
                </SectionCard>

                {/* Physical */}
                <SectionCard icon={<Zap className="w-5 h-5 text-white" />} title="Physical Activity & Comfort" iconBg="bg-amber-400" status={data.mobilityLevel <= 2 || data.painLevel >= 4 ? (data.painLevel === 5 ? "critical" : "moderate") : "stable"}>
                  <MetricCard icon={<span className="text-lg">🚶</span>} label="Mobility" value={`${data.mobilityLevel}/5`} warning={data.mobilityLevel <= 2} />
                  <MetricCard icon={<span className="text-lg">{data.painLevel >= 4 ? "🤕" : "💪"}</span>} label="Pain level" value={painLabel(data.painLevel)} warning={data.painLevel >= 4} />
                  <MetricCard icon={<span className="text-lg">⏱️</span>} label="Exercise" value={`${data.exerciseMinutes} min`} />
                  <MetricCard icon={<span className="text-lg">{data.didStretching ? "🧘" : "—"}</span>} label="Stretching" value={data.didStretching ? "Done" : "Not today"} />
                  <MetricCard icon={<span className="text-lg">{data.didPhysicalTherapy ? "🏥" : "—"}</span>} label="Physical Therapy" value={data.didPhysicalTherapy ? "Done" : "Not today"} />
                  <MetricCard icon={<span className="text-lg">{data.usedWalkingAid ? "🦯" : "🚶"}</span>} label="Walking Aid" value={data.usedWalkingAid ? "Used" : "Not needed"} />
                </SectionCard>
              </>
            )}

            {/* ============ MEDICATIONS TAB ============ */}
            {activeTab === "medications" && (
              <>
                <SectionCard icon={<Pill className="w-5 h-5 text-white" />} title="Medicines & Monitoring" iconBg="bg-emerald-400" status={!data.medicationTaken ? "critical" : "stable"} fullGrid>
                  <MetricCard icon={<span className="text-lg">{data.medicationTaken ? "✅" : "❌"}</span>} label="All Medications" value={data.medicationTaken ? "Taken today" : "Not all taken"} warning={!data.medicationTaken} />
                  <MetricCard icon={<span className="text-lg">❤️</span>} label="Blood pressure" value={data.bloodPressure || "Not recorded"} />
                  <MetricCard icon={<span className="text-lg">🩸</span>} label="Blood sugar" value={data.bloodSugar || "Not recorded"} />
                  <MetricCard icon={<span className="text-lg">🫀</span>} label="Cholesterol" value={data.cholesterol || "Not recorded"} />
                  <MetricCard icon={<span className="text-lg">💉</span>} label="Diabetes (Glucose)" value={data.diabetesReading || "Not recorded"} />
                </SectionCard>

                {/* Medication Schedule */}
                {data.medications && data.medications.length > 0 && (
                  <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 bg-emerald-400 rounded-xl flex items-center justify-center">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground text-sm">Medication Schedule</h3>
                    </div>
                    <div className="space-y-2">
                      {data.medications.map((med, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${med.taken ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${med.taken ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                            {med.taken ? "✓" : "○"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground">{med.name}</div>
                            <div className="text-xs text-muted-foreground">{med.dose} · {med.time} · {med.frequency}</div>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${med.taken ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {med.taken ? "Taken" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {data.allergies && (
                  <div className="bg-card rounded-2xl p-4 shadow-card border border-destructive/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-semibold text-sm text-foreground">Known Allergies</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {data.allergies.split(",").map((a, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full font-medium">
                          {a.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Effects */}
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
                      <p className="text-xs text-muted-foreground">{data.appointments.length} appointment{data.appointments.length > 1 ? "s" : ""} scheduled</p>
                    </div>
                    {data.appointments.map((appt, i) => (
                      <div key={i} className="bg-card rounded-2xl p-4 shadow-card border border-border flex gap-4 items-start">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{appt.title}</div>
                          <div className="text-sm text-muted-foreground">Dr. {appt.doctor}</div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs text-primary font-medium">{appt.date} {appt.time && `· ${appt.time}`}</span>
                          </div>
                          {appt.notes && <p className="text-xs text-muted-foreground mt-1 italic">{appt.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
                    <div className="text-4xl mb-3">📅</div>
                    <h2 className="font-bold text-foreground mb-1">No appointments</h2>
                    <p className="text-muted-foreground text-sm">Your parent hasn't added any upcoming appointments yet.</p>
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
                <p className="text-xs text-muted-foreground -mt-2">Tracking this week's patterns at a glance</p>

                <WeeklyBar values={moodWeek} label="Mood (1–5)" color="bg-violet-400" />
                <div className="h-px bg-border" />
                <WeeklyBar values={stepsWeek.map(v => Math.round(v / 100))} label="Steps (hundreds)" color="bg-cyan-500" />
                <div className="h-px bg-border" />
                <WeeklyBar values={sleepWeek} label="Sleep Hours" color="bg-indigo-400" />
                <div className="h-px bg-border" />
                <WeeklyBar values={hrWeek.map(v => Math.round(v / 10))} label="Heart Rate (÷10)" color="bg-rose-400" />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Mood</div>
                    <div className="text-lg font-bold text-primary">{(moodWeek.reduce((a, b) => a + b, 0) / moodWeek.length).toFixed(1)}/5</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Steps</div>
                    <div className="text-lg font-bold text-primary">{Math.round(stepsWeek.reduce((a, b) => a + b, 0) / stepsWeek.length).toLocaleString()}</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Sleep</div>
                    <div className="text-lg font-bold text-foreground">{(sleepWeek.reduce((a, b) => a + b, 0) / sleepWeek.length).toFixed(1)}h</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Avg Heart Rate</div>
                    <div className="text-lg font-bold text-destructive">{Math.round(hrWeek.reduce((a, b) => a + b, 0) / hrWeek.length)} bpm</div>
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
                  <div key={i} className="bg-card rounded-2xl p-4 shadow-card border border-border flex gap-3 items-start">
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
