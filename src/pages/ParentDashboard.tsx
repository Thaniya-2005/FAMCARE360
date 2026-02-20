import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ArrowLeft, Smile, Droplets, Moon, Zap, Pill, Shield, MessageCircle, AlertTriangle, Footprints, Thermometer, Activity } from "lucide-react";
import { HealthData, getDefaultHealthData } from "@/types/health";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "famcare360_health_data";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}

function Section({ icon, title, color, children }: SectionProps) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <h2 className="font-bold text-foreground text-base">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ScoreRow({ label, value, onChange, min = 1, max = 5, lowLabel, highLabel }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; lowLabel?: string; highLabel?: string;
}) {
  const emojis = max === 5 && min === 1 ? ["😟", "😕", "😐", "🙂", "😊"] : [];
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex items-center gap-1.5">
          {emojis[value - 1] && <span className="text-lg">{emojis[value - 1]}</span>}
          <span className="text-sm font-bold text-primary w-8 text-right">{value}</span>
        </div>
      </div>
      <Slider
        min={min} max={max} step={1} value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{lowLabel}</span>
          <span className="text-xs text-muted-foreground">{highLabel}</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${value ? "bg-primary" : "bg-muted"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow ${value ? "left-6" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function NumberInput({ label, value, onChange, unit, placeholder }: {
  label: string; value: number | string; onChange: (v: string) => void;
  unit?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <div className="relative">
        <Input
          type="number"
          placeholder={placeholder ?? "0"}
          value={value === 0 ? "" : value}
          onChange={e => onChange(e.target.value)}
          className="text-sm pr-12"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">{unit}</span>
        )}
      </div>
    </div>
  );
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<HealthData>(getDefaultHealthData);
  const [submitted, setSubmitted] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today) {
          setData(parsed);
          setSubmitted(true);
        }
      } catch {}
    }
  }, []);

  const update = (field: keyof HealthData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const final = { ...data, sosActivated: sosActive };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
    setSubmitted(true);
    toast({
      title: "Health update submitted! 💙",
      description: "Your family can now see your daily health status.",
    });
  };

  const handleSOS = () => {
    setSosActive(true);
    const final = { ...data, sosActivated: true };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
    toast({
      title: "🚨 Emergency Alert Sent!",
      description: "Your family has been notified immediately.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-parent px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Parent Dashboard</h1>
              <p className="text-white/70 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          {submitted && (
            <div className="mt-4 bg-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-white text-sm font-medium">✓ Today's update submitted</span>
            </div>
          )}
        </div>
      </div>

      {/* SOS Button */}
      <div className="max-w-xl mx-auto px-4 -mt-4">
        {sosActive ? (
          <div className="gradient-sos rounded-2xl p-4 flex items-center gap-3 shadow-sos animate-pulse">
            <AlertTriangle className="w-6 h-6 text-white flex-shrink-0" />
            <div>
              <div className="text-white font-bold">🚨 Emergency Alert Active</div>
              <div className="text-white/80 text-sm">Your family has been notified</div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleSOS}
            className="w-full gradient-sos rounded-2xl p-4 flex items-center justify-center gap-3 shadow-sos hover:opacity-90 transition-opacity"
          >
            <AlertTriangle className="w-6 h-6 text-white" />
            <div className="text-left">
              <div className="text-white font-bold text-base">Emergency SOS</div>
              <div className="text-white/80 text-sm">Tap to alert your family immediately</div>
            </div>
          </button>
        )}
      </div>

      {/* Sections */}
      <div className="max-w-xl mx-auto px-4 mt-5 space-y-4">

        {/* 1. Vital Signs — NEW */}
        <Section icon={<Activity className="w-5 h-5 text-white" />} title="Vital Signs" color="bg-cyan-500">
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Heart Rate"
              value={data.heartRate}
              onChange={v => update("heartRate", parseFloat(v) || 0)}
              unit="bpm"
              placeholder="72"
            />
            <NumberInput
              label="Temperature"
              value={data.temperature}
              onChange={v => update("temperature", parseFloat(v) || 0)}
              unit="°F"
              placeholder="98.6"
            />
          </div>
          <NumberInput
            label="Step Count Today"
            value={data.stepsCount}
            onChange={v => update("stepsCount", parseInt(v) || 0)}
            unit="steps"
            placeholder="0"
          />
          {/* Step progress ring visual */}
          <div className="flex items-center gap-4 bg-muted/30 rounded-xl p-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray={`${Math.min((data.stepsCount / 8000) * 100, 100)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Footprints className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{data.stepsCount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">steps · Goal: 8,000</div>
              <div className="text-xs text-primary font-medium mt-0.5">{Math.round((data.stepsCount / 8000) * 100)}% of goal</div>
            </div>
          </div>
        </Section>

        {/* 2. Mental & Emotional */}
        <Section icon={<Smile className="w-5 h-5 text-white" />} title="Mental & Emotional Well-being" color="bg-violet-400">
          <ScoreRow label="How is your mood today?" value={data.moodScore} onChange={v => update("moodScore", v)} lowLabel="Very sad" highLabel="Very happy" />
          <ScoreRow label="Stress level" value={data.stressLevel} onChange={v => update("stressLevel", v)} lowLabel="Very calm" highLabel="Very stressed" />
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Any feelings to share?</label>
            <Textarea
              placeholder="Write about how you're feeling today..."
              value={data.emotionalNotes}
              onChange={e => update("emotionalNotes", e.target.value)}
              className="text-sm resize-none h-20"
            />
          </div>
        </Section>

        {/* 3. Food & Hydration */}
        <Section icon={<Droplets className="w-5 h-5 text-white" />} title="Food & Hydration" color="bg-sky-400">
          <ScoreRow label="Meals eaten today" value={data.mealsEaten} onChange={v => update("mealsEaten", v)} min={0} max={3} lowLabel="None" highLabel="All 3" />
          <ScoreRow label="Water intake (cups)" value={data.waterIntake} onChange={v => update("waterIntake", v)} min={0} max={12} lowLabel="0 cups" highLabel="12+ cups" />
          <Toggle label="Appetite feels good today?" value={data.appetiteGood} onChange={v => update("appetiteGood", v)} />
          <ScoreRow label="Diet Habits Score" value={data.dietHabitsScore} onChange={v => update("dietHabitsScore", v)} min={0} max={100} lowLabel="Poor diet" highLabel="Excellent diet" />
        </Section>

        {/* 4. Sleep & Rest */}
        <Section icon={<Moon className="w-5 h-5 text-white" />} title="Sleep & Rest" color="bg-indigo-400">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Bedtime</label>
              <Input
                placeholder="e.g. 10:30 PM"
                value={data.sleepInBedTime}
                onChange={e => update("sleepInBedTime", e.target.value)}
                className="text-sm"
              />
            </div>
            <NumberInput
              label="Total Sleep"
              value={data.sleepHours}
              onChange={v => update("sleepHours", parseFloat(v) || 0)}
              unit="hrs"
              placeholder="7"
            />
          </div>
          <ScoreRow label="Sleep quality" value={data.sleepQuality} onChange={v => update("sleepQuality", v)} lowLabel="Very poor" highLabel="Excellent" />
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sleep Breakdown</div>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Deep Sleep" value={data.deepSleepHours} onChange={v => update("deepSleepHours", parseFloat(v) || 0)} unit="hrs" placeholder="2" />
            <NumberInput label="Light Sleep" value={data.lightSleepHours} onChange={v => update("lightSleepHours", parseFloat(v) || 0)} unit="hrs" placeholder="3" />
            <NumberInput label="REM Sleep" value={data.remSleepHours} onChange={v => update("remSleepHours", parseFloat(v) || 0)} unit="hrs" placeholder="1.5" />
            <NumberInput label="Awake (mins)" value={data.awakeDuringNight} onChange={v => update("awakeDuringNight", parseInt(v) || 0)} unit="min" placeholder="30" />
          </div>
          <Toggle label="Had a nap during the day?" value={data.hadNap} onChange={v => update("hadNap", v)} />
        </Section>

        {/* 5. Physical Activity */}
        <Section icon={<Zap className="w-5 h-5 text-white" />} title="Physical Activity & Comfort" color="bg-amber-400">
          <ScoreRow label="Mobility level" value={data.mobilityLevel} onChange={v => update("mobilityLevel", v)} lowLabel="Cannot move" highLabel="Fully mobile" />
          <ScoreRow label="Pain or discomfort level" value={data.painLevel} onChange={v => update("painLevel", v)} min={0} max={5} lowLabel="No pain" highLabel="Severe pain" />
          <NumberInput
            label="Exercise / Walk Duration"
            value={data.exerciseMinutes}
            onChange={v => update("exerciseMinutes", parseInt(v) || 0)}
            unit="min"
            placeholder="0"
          />
        </Section>

        {/* 6. Medicines & Monitoring */}
        <Section icon={<Pill className="w-5 h-5 text-white" />} title="Medicines & Health Monitoring" color="bg-emerald-400">
          <Toggle label="Took all medications today?" value={data.medicationTaken} onChange={v => update("medicationTaken", v)} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Blood Pressure</label>
              <Input placeholder="120/80 mmHg" value={data.bloodPressure} onChange={e => update("bloodPressure", e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Blood Sugar</label>
              <Input placeholder="100 mg/dL" value={data.bloodSugar} onChange={e => update("bloodSugar", e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Cholesterol</label>
              <Input placeholder="200 mg/dL" value={data.cholesterol} onChange={e => update("cholesterol", e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Diabetes (Glucose)</label>
              <Input placeholder="90 mg/dL" value={data.diabetesReading} onChange={e => update("diabetesReading", e.target.value)} className="text-sm" />
            </div>
          </div>
        </Section>

        {/* 7. Lifestyle Score */}
        <Section icon={<Thermometer className="w-5 h-5 text-white" />} title="Lifestyle Score" color="bg-fuchsia-500">
          <ScoreRow label="Overall Diet & Lifestyle Rating" value={data.lifestyleScore} onChange={v => update("lifestyleScore", v)} min={0} max={100} lowLabel="Needs improvement" highLabel="Excellent" />
          <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-3">
            <div className="text-4xl font-bold text-primary">{data.lifestyleScore}</div>
            <div>
              <div className="text-xs font-semibold text-foreground">Lifestyle Score</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {data.lifestyleScore >= 80 ? "🌟 Excellent lifestyle!" : data.lifestyleScore >= 60 ? "👍 Good, keep it up!" : data.lifestyleScore >= 40 ? "⚠️ Room for improvement" : "🔴 Needs attention"}
              </div>
            </div>
          </div>
        </Section>

        {/* 8. Overall Safety */}
        <Section icon={<Shield className="w-5 h-5 text-white" />} title="Overall Health & Safety" color="bg-rose-400">
          <Toggle label="Feeling safe at home?" value={data.feltSafe} onChange={v => update("feltSafe", v)} />
          <Toggle label="Had a fall today?" value={data.hadFall} onChange={v => update("hadFall", v)} />
          <Toggle label="Need help with anything?" value={data.needsHelp} onChange={v => update("needsHelp", v)} />
        </Section>

        {/* 9. Bonding Message */}
        <Section icon={<MessageCircle className="w-5 h-5 text-white" />} title="Daily Message to Family 💙" color="bg-pink-400">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Share a message with your child today</label>
            <Textarea
              placeholder="Write something meaningful... 'Thinking of you today!'"
              value={data.bondingMessage}
              onChange={e => update("bondingMessage", e.target.value)}
              className="text-sm resize-none h-24"
            />
          </div>
        </Section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full gradient-parent text-white font-bold py-4 rounded-2xl shadow-card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 text-base"
        >
          {submitted ? "✓ Update Today's Report" : "Submit Daily Health Report"}
        </button>
      </div>
    </div>
  );
};

export default ParentDashboard;
