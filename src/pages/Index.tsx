import { useNavigate } from "react-router-dom";
import { Heart, Shield, ChevronRight, Activity, Bell, Users, Calculator, UtensilsCrossed, Dumbbell, BarChart2 } from "lucide-react";
import heroImage from "@/assets/hero-family.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Activity, label: "Daily Health Tracking", desc: "Vitals, mood, sleep & more" },
    { icon: Bell, label: "Emergency SOS Alerts", desc: "Instant family notifications" },
    { icon: Users, label: "Family Bond Messages", desc: "Stay emotionally connected" },
    { icon: Calculator, label: "BMI & Workout Planner", desc: "Personalized fitness plans" },
    { icon: UtensilsCrossed, label: "Meal & Calorie Tracker", desc: "Log food & nutrition" },
    { icon: Dumbbell, label: "Exercise Tracker", desc: "Track reps, sets & calories" },
  ];

  const quickLinks = [
    { path: "/bmi", icon: Calculator, label: "BMI Calculator", color: "bg-emerald-500", emoji: "🧮" },
    { path: "/meals", icon: UtensilsCrossed, label: "Meal Tracker", color: "bg-amber-500", emoji: "🍽️" },
    { path: "/exercise", icon: Dumbbell, label: "Exercise", color: "bg-violet-500", emoji: "💪" },
    { path: "/routine", icon: BarChart2, label: "Daily Routine", color: "bg-sky-500", emoji: "📊" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 gradient-hero rounded-xl flex items-center justify-center shadow-card">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">FamCare<span className="text-primary">360</span></span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center px-6 py-6 text-center">
        <div className="relative w-full max-w-2xl mx-auto mb-8">
          <div className="absolute inset-0 gradient-hero opacity-10 rounded-3xl blur-3xl" />
          <img
            src={heroImage}
            alt="FamCare360 Family Health"
            className="w-full h-56 object-cover rounded-3xl shadow-card relative"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-3xl" />
        </div>

        <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Smart Family Health Monitoring</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
          Stay connected to<br />
          <span className="text-primary">what matters most</span>
        </h1>
        <p className="text-muted-foreground text-base max-w-md mb-8">
          Monitor your parents' daily health, track fitness, meals & receive emergency alerts — all in one place.
        </p>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 w-full max-w-lg">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border border-border shadow-sm">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">{label}</span>
              <span className="text-[10px] text-muted-foreground text-center">{desc}</span>
            </div>
          ))}
        </div>

        {/* Quick Access Tools */}
        <div className="w-full max-w-sm mb-8">
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Quick Access Tools</p>
          <div className="grid grid-cols-4 gap-2">
            {quickLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="flex flex-col items-center gap-1.5 p-3 bg-card rounded-xl border border-border shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-lg">{link.emoji}</span>
                </div>
                <span className="text-[10px] font-semibold text-foreground text-center leading-tight">{link.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Selection */}
        <div className="w-full max-w-sm">
          <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Choose your role to continue</p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/parent")}
              className="group relative w-full gradient-parent text-white rounded-2xl p-5 flex items-center justify-between shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👴</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">I'm a Parent</div>
                  <div className="text-white/80 text-sm">Share your daily health updates</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/child")}
              className="group relative w-full gradient-child text-white rounded-2xl p-5 flex items-center justify-between shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🧑</span>
                </div>
                <div className="text-left">
                  <div className="font-bold text-lg">I'm a Child</div>
                  <div className="text-white/80 text-sm">Monitor your parent's well-being</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        FamCare360 — Keeping families closer, together.
      </footer>
    </div>
  );
};

export default Index;
