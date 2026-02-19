import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, RefreshCw, Smile, Droplets, Moon, Zap, Pill, Shield, MessageCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { HealthData, HealthStatus, calculateHealthStatus } from "@/types/health";

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
}

function SectionCard({ icon, title, iconBg, children, status }: SectionCardProps) {
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
      <div className="grid grid-cols-2 gap-2">{children}</div>
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

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<HealthData | null>(null);
  const [refreshTime, setRefreshTime] = useState(new Date());

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

  const riskAlerts: string[] = [];
  if (data) {
    if (data.moodScore <= 2) riskAlerts.push("Low mood detected");
    if (data.stressLevel >= 4) riskAlerts.push("High stress levels");
    if (data.mealsEaten <= 1) riskAlerts.push("Missed meals");
    if (data.waterIntake < 4) riskAlerts.push("Low water intake");
    if (data.sleepHours < 5) riskAlerts.push("Insufficient sleep");
    if (data.painLevel >= 4) riskAlerts.push("High pain reported");
    if (!data.medicationTaken) riskAlerts.push("Medication not taken");
    if (data.hadFall) riskAlerts.push("⚠️ Fall occurred today");
    if (data.needsHelp) riskAlerts.push("Needs assistance");
  }

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

        {/* No data */}
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
            </div>

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

            {/* Mental & Emotional */}
            <SectionCard
              icon={<Smile className="w-5 h-5 text-white" />}
              title="Mental & Emotional Well-being"
              iconBg="bg-violet-400"
              status={data.moodScore <= 2 || data.stressLevel >= 4 ? (data.moodScore === 1 || data.stressLevel === 5 ? "critical" : "moderate") : "stable"}
            >
              <MetricCard icon={<span className="text-lg">{["😟","😕","😐","🙂","😊"][data.moodScore-1]}</span>} label="Mood" value={moodLabel(data.moodScore)} warning={data.moodScore <= 2} />
              <MetricCard icon={<span className="text-lg">{data.stressLevel >= 4 ? "😰" : "😌"}</span>} label="Stress" value={`${data.stressLevel}/5`} warning={data.stressLevel >= 4} />
              {data.emotionalNotes && (
                <div className="col-span-2 bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground italic">
                  "{data.emotionalNotes}"
                </div>
              )}
            </SectionCard>

            {/* Food & Hydration */}
            <SectionCard
              icon={<Droplets className="w-5 h-5 text-white" />}
              title="Food & Hydration"
              iconBg="bg-sky-400"
              status={data.mealsEaten <= 1 || data.waterIntake < 4 ? "moderate" : "stable"}
            >
              <MetricCard icon={<span className="text-lg">🍽️</span>} label="Meals eaten" value={`${data.mealsEaten}/3 meals`} warning={data.mealsEaten <= 1} />
              <MetricCard icon={<span className="text-lg">💧</span>} label="Water intake" value={`${data.waterIntake} cups`} warning={data.waterIntake < 4} />
              <MetricCard icon={<span className="text-lg">{data.appetiteGood ? "✅" : "❌"}</span>} label="Appetite" value={data.appetiteGood ? "Good" : "Poor"} warning={!data.appetiteGood} />
            </SectionCard>

            {/* Sleep */}
            <SectionCard
              icon={<Moon className="w-5 h-5 text-white" />}
              title="Sleep & Rest"
              iconBg="bg-indigo-400"
              status={data.sleepHours < 5 || data.sleepQuality <= 2 ? (data.sleepHours < 4 ? "critical" : "moderate") : "stable"}
            >
              <MetricCard icon={<span className="text-lg">🌙</span>} label="Sleep duration" value={`${data.sleepHours} hours`} warning={data.sleepHours < 5} />
              <MetricCard icon={<span className="text-lg">{["😴","😴","😐","😊","⭐"][data.sleepQuality-1]}</span>} label="Sleep quality" value={`${data.sleepQuality}/5`} warning={data.sleepQuality <= 2} />
              <MetricCard icon={<span className="text-lg">☀️</span>} label="Daytime nap" value={data.hadNap ? "Yes" : "No"} />
            </SectionCard>

            {/* Physical */}
            <SectionCard
              icon={<Zap className="w-5 h-5 text-white" />}
              title="Physical Activity & Comfort"
              iconBg="bg-amber-400"
              status={data.mobilityLevel <= 2 || data.painLevel >= 4 ? (data.painLevel === 5 ? "critical" : "moderate") : "stable"}
            >
              <MetricCard icon={<span className="text-lg">🚶</span>} label="Mobility" value={`${data.mobilityLevel}/5`} warning={data.mobilityLevel <= 2} />
              <MetricCard icon={<span className="text-lg">{data.painLevel >= 4 ? "🤕" : "💪"}</span>} label="Pain level" value={painLabel(data.painLevel)} warning={data.painLevel >= 4} />
              <MetricCard icon={<span className="text-lg">⏱️</span>} label="Exercise" value={`${data.exerciseMinutes} min`} />
            </SectionCard>

            {/* Medicines */}
            <SectionCard
              icon={<Pill className="w-5 h-5 text-white" />}
              title="Medicines & Monitoring"
              iconBg="bg-emerald-400"
              status={!data.medicationTaken ? "critical" : "stable"}
            >
              <MetricCard icon={<span className="text-lg">{data.medicationTaken ? "✅" : "❌"}</span>} label="Medication" value={data.medicationTaken ? "Taken" : "Not taken"} warning={!data.medicationTaken} />
              <MetricCard icon={<span className="text-lg">❤️</span>} label="Blood pressure" value={data.bloodPressure || "Not recorded"} />
              <MetricCard icon={<span className="text-lg">🩸</span>} label="Blood sugar" value={data.bloodSugar || "Not recorded"} />
            </SectionCard>

            {/* Safety */}
            <SectionCard
              icon={<Shield className="w-5 h-5 text-white" />}
              title="Overall Safety"
              iconBg="bg-rose-400"
              status={data.hadFall || !data.feltSafe ? "critical" : data.needsHelp ? "moderate" : "stable"}
            >
              <MetricCard icon={<span className="text-lg">{data.feltSafe ? "🏠" : "⚠️"}</span>} label="Feeling safe" value={data.feltSafe ? "Yes" : "No"} warning={!data.feltSafe} />
              <MetricCard icon={<span className="text-lg">{data.hadFall ? "🚨" : "✅"}</span>} label="Had a fall" value={data.hadFall ? "YES - FELL" : "No fall"} warning={data.hadFall} />
              <MetricCard icon={<span className="text-lg">{data.needsHelp ? "🙏" : "✅"}</span>} label="Needs help" value={data.needsHelp ? "Yes" : "No"} warning={data.needsHelp} />
            </SectionCard>

            {/* Weekly Trend Placeholder */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-sm">Weekly Health Trend</h3>
              </div>
              <div className="flex items-end gap-2 h-16">
                {[3, 4, 2, 4, 5, data.moodScore, data.moodScore].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg transition-all ${i === 6 ? "bg-primary" : "bg-primary/30"}`}
                      style={{ height: `${(v / 5) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {["M", "T", "W", "T", "F", "S", "Today"][i]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Mood trend this week (1–5 scale)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChildDashboard;
