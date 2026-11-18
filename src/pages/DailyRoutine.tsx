import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, Moon, Droplets, Pill, UtensilsCrossed,
  Dumbbell, Footprints, Activity, AlertTriangle, TrendingUp, Calendar, Heart
} from "lucide-react";
import { HealthData, calculateHealthStatus, calculateLifestyleScore } from "@/types/health";
import { useAuth } from "@/contexts/AuthContext";
import {
  healthService, DayMeals, DayExercises, MealItem
} from "@/services/healthService";

interface TimelineItem {
  time: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  status: "good" | "warning" | "danger" | "neutral";
  sortKey: number;
}

function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const match = t.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2] || "0");
  const ampm = match[3];
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
  }
  return h * 60 + m;
}

const statusColors = {
  good: "border-primary/40 bg-primary/5",
  warning: "border-amber-300 bg-amber-50 dark:bg-amber-950/20",
  danger: "border-destructive/40 bg-destructive/5",
  neutral: "border-border bg-muted/30",
};

const statusDotColors = {
  good: "bg-primary",
  warning: "bg-amber-400",
  danger: "bg-destructive",
  neutral: "bg-muted-foreground",
};

const DailyRoutine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<HealthData | null>(null);
  const [mealData, setMealData] = useState<DayMeals | null>(null);
  const [exerciseData, setExerciseData] = useState<DayExercises | null>(null);

  const loadData = useCallback(async () => {
    const targetUserId = user?.id;
    const h = await healthService.getTodayHealthReport(targetUserId);
    if (h) setData(h);

    const m = await healthService.getMeals(targetUserId);
    setMealData(m);

    const e = await healthService.getExercises(targetUserId);
    setExerciseData(e);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const status = data ? calculateHealthStatus(data) : "stable";
  const lifestyleScore = data ? calculateLifestyleScore(data) : 0;

  // Build timeline
  const timeline: TimelineItem[] = [];

  if (data) {
    // Wake up
    if (data.wakeUpTime) {
      timeline.push({
        time: data.wakeUpTime,
        icon: <Clock className="w-4 h-4" />,
        title: "Wake Up",
        detail: `Woke up at ${data.wakeUpTime}`,
        status: "neutral",
        sortKey: parseTimeToMinutes(data.wakeUpTime),
      });
    }

    // Sleep
    if (data.sleepInBedTime) {
      timeline.push({
        time: data.sleepInBedTime,
        icon: <Moon className="w-4 h-4" />,
        title: "Bedtime",
        detail: `${data.sleepHours}h sleep · Quality: ${data.sleepQuality}/5`,
        status: data.sleepHours >= 7 ? "good" : data.sleepHours >= 5 ? "warning" : "danger",
        sortKey: parseTimeToMinutes(data.sleepInBedTime),
      });
    }

    // Breakfast
    timeline.push({
      time: "8:00 AM",
      icon: <UtensilsCrossed className="w-4 h-4" />,
      title: "Breakfast",
      detail: data.ateBreakfast ? "Had breakfast ✅" : "Skipped breakfast ❌",
      status: data.ateBreakfast ? "good" : "warning",
      sortKey: 480,
    });

    // Medication
    if (data.medications.length > 0) {
      const takenCount = data.medications.filter((m) => m.taken).length;
      timeline.push({
        time: "9:00 AM",
        icon: <Pill className="w-4 h-4" />,
        title: "Medications",
        detail: `${takenCount}/${data.medications.length} taken`,
        status: takenCount === data.medications.length ? "good" : "danger",
        sortKey: 540,
      });
    }

    // Vitals check
    timeline.push({
      time: "10:00 AM",
      icon: <Activity className="w-4 h-4" />,
      title: "Vital Signs",
      detail: `HR: ${data.heartRate} bpm · Temp: ${data.temperature}°F`,
      status:
        data.heartRate > 100 || data.heartRate < 50 || data.temperature > 99.5
          ? "danger"
          : "good",
      sortKey: 600,
    });

    // Lunch
    timeline.push({
      time: "12:30 PM",
      icon: <UtensilsCrossed className="w-4 h-4" />,
      title: "Lunch",
      detail: data.ateLunch ? "Had lunch ✅" : "Skipped lunch ❌",
      status: data.ateLunch ? "good" : "warning",
      sortKey: 750,
    });

    // Outdoor/walk
    if (data.stepsCount > 0 || data.exerciseMinutes > 0) {
      timeline.push({
        time: "3:00 PM",
        icon: <Footprints className="w-4 h-4" />,
        title: "Physical Activity",
        detail: `${data.stepsCount.toLocaleString()} steps · ${data.exerciseMinutes} min exercise`,
        status: data.stepsCount >= 5000 ? "good" : data.stepsCount >= 2000 ? "warning" : "danger",
        sortKey: 900,
      });
    }

    // Hydration
    timeline.push({
      time: "4:00 PM",
      icon: <Droplets className="w-4 h-4" />,
      title: "Hydration Check",
      detail: `${data.waterIntake} cups of water`,
      status: data.waterIntake >= 8 ? "good" : data.waterIntake >= 4 ? "warning" : "danger",
      sortKey: 960,
    });

    // Dinner
    timeline.push({
      time: "7:00 PM",
      icon: <UtensilsCrossed className="w-4 h-4" />,
      title: "Dinner",
      detail: data.ateDinner ? "Had dinner ✅" : "Skipped dinner ❌",
      status: data.ateDinner ? "good" : "warning",
      sortKey: 1140,
    });

    // Appointments
    if (data.appointments && data.appointments.length > 0) {
      data.appointments.forEach((appt) => {
        timeline.push({
          time: appt.time || "Scheduled",
          icon: <Calendar className="w-4 h-4" />,
          title: `Dr. Appointment: ${appt.title}`,
          detail: `Dr. ${appt.doctor} · ${appt.date}${appt.notes ? ` (${appt.notes})` : ""}`,
          status: "neutral",
          sortKey: parseTimeToMinutes(appt.time || "11:00 AM"),
        });
      });
    }

    // Bonding Message
    if (data.bondingMessage) {
      timeline.push({
        time: "Evening",
        icon: <Heart className="w-4 h-4" />,
        title: "Family Message",
        detail: `"${data.bondingMessage}"`,
        status: "good",
        sortKey: 1200,
      });
    }

    // SOS
    if (data.sosActivated) {
      timeline.push({
        time: "URGENT",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "🚨 SOS ACTIVATED",
        detail: "Emergency alert was triggered",
        status: "danger",
        sortKey: 0,
      });
    }
  }

  // Add meal data
  if (mealData?.meals && mealData.meals.length > 0) {
    const totalMealCal = mealData.meals.reduce(
      (s: number, m: MealItem) => s + (m.calories || 0),
      0
    );
    if (totalMealCal > 0) {
      timeline.push({
        time: "All Day",
        icon: <UtensilsCrossed className="w-4 h-4" />,
        title: "Total Nutrition",
        detail: `${totalMealCal} kcal consumed · ${mealData.waterCups || 0} cups water`,
        status: totalMealCal >= 1500 && totalMealCal <= 2500 ? "good" : "warning",
        sortKey: 1300,
      });
    }
  }

  // Add exercise data
  if (exerciseData?.logs && exerciseData.logs.length > 0) {
    timeline.push({
      time: "Workout",
      icon: <Dumbbell className="w-4 h-4" />,
      title: "Exercise Session",
      detail: `${exerciseData.logs.length} exercises · ${exerciseData.totalCalories} kcal burned · ${Math.round(
        exerciseData.totalDuration / 60
      )} min`,
      status: "good",
      sortKey: 950,
    });
  }

  timeline.sort((a, b) => a.sortKey - b.sortKey);

  // Summary cards
  const summaryCards = data
    ? [
        {
          label: "Lifestyle Score",
          value: `${lifestyleScore}/100`,
          color:
            lifestyleScore >= 70
              ? "text-primary"
              : lifestyleScore >= 40
              ? "text-amber-500"
              : "text-destructive",
        },
        {
          label: "Steps",
          value: data.stepsCount.toLocaleString(),
          color: data.stepsCount >= 5000 ? "text-primary" : "text-amber-500",
        },
        {
          label: "Sleep",
          value: `${data.sleepHours}h`,
          color: data.sleepHours >= 7 ? "text-primary" : "text-amber-500",
        },
        {
          label: "Heart Rate",
          value: `${data.heartRate} bpm`,
          color:
            data.heartRate >= 60 && data.heartRate <= 100
              ? "text-primary"
              : "text-destructive",
        },
        {
          label: "Meals",
          value: `${data.mealsEaten}/3`,
          color: data.mealsEaten >= 3 ? "text-primary" : "text-amber-500",
        },
        {
          label: "Water",
          value: `${data.waterIntake} cups`,
          color: data.waterIntake >= 8 ? "text-primary" : "text-amber-500",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="gradient-child px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Daily Routine Dashboard</h1>
              <p className="text-white/70 text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 space-y-4">
        {!data ? (
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
            <div className="text-4xl mb-3">📊</div>
            <h2 className="font-bold text-foreground mb-1">No Data Yet</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Submit a health report from the Parent Dashboard to see your daily routine visualization.
            </p>
            <button
              onClick={() => navigate("/parent")}
              className="px-4 py-2 gradient-parent text-white rounded-xl text-sm font-semibold"
            >
              Go to Parent Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Health Status Header */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground">Today&apos;s Overview</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
                    status === "stable"
                      ? "status-green"
                      : status === "moderate"
                      ? "status-yellow"
                      : "status-red"
                  }`}
                >
                  {status === "stable" ? "✅ Stable" : status === "moderate" ? "⚠️ Moderate" : "🚨 Critical"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {summaryCards.map((c, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-2.5 text-center">
                    <div className={`text-lg font-bold ${c.color}`}>{c.value}</div>
                    <div className="text-[10px] text-muted-foreground">{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-bold text-foreground">Day Timeline</h2>
              </div>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

                <div className="space-y-3">
                  {timeline.map((item, i) => (
                    <div key={i} className="flex gap-3 relative">
                      {/* Dot */}
                      <div
                        className={`w-10 h-10 rounded-full ${statusDotColors[item.status]} flex items-center justify-center text-white flex-shrink-0 z-10 shadow-sm`}
                      >
                        {item.icon}
                      </div>
                      {/* Content */}
                      <div className={`flex-1 rounded-xl p-3 border ${statusColors[item.status]}`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm font-semibold text-foreground">{item.title}</span>
                          <span className="text-xs text-muted-foreground font-medium">{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Summary Donut */}
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-3">Daily Score Breakdown</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sleep Quality", value: (data.sleepQuality / 5) * 100, color: "hsl(var(--primary))" },
                  { label: "Mood", value: (data.moodScore / 5) * 100, color: "hsl(262, 50%, 60%)" },
                  { label: "Nutrition", value: (data.mealsEaten / 3) * 100, color: "hsl(var(--accent))" },
                  {
                    label: "Activity",
                    value: Math.min((data.stepsCount / 8000) * 100, 100),
                    color: "hsl(142, 65%, 40%)",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="3"
                          strokeDasharray={`${item.value} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground">{Math.round(item.value)}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(item.value) >= 80
                          ? "Excellent"
                          : Math.round(item.value) >= 50
                          ? "Good"
                          : "Needs work"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DailyRoutine;
