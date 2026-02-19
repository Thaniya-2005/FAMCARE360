import { useNavigate } from "react-router-dom";
import { Heart, Shield, ChevronRight, Activity, Bell, Users } from "lucide-react";
import heroImage from "@/assets/hero-family.png";

const Index = () => {
  const navigate = useNavigate();

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
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="relative w-full max-w-2xl mx-auto mb-10">
          <div className="absolute inset-0 gradient-hero opacity-10 rounded-3xl blur-3xl" />
          <img
            src={heroImage}
            alt="FamCare360 Family Health"
            className="w-full h-64 object-cover rounded-3xl shadow-card relative"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent rounded-3xl" />
        </div>

        <div className="mb-3 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Smart Family Health Monitoring</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Stay connected to<br />
          <span className="text-primary">what matters most</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mb-12">
          Monitor your parents' daily health, receive emergency alerts, and strengthen family bonds — all in one place.
        </p>

        {/* Features row */}
        <div className="flex gap-6 mb-12 flex-wrap justify-center">
          {[
            { icon: Activity, label: "Daily Health Tracking" },
            { icon: Bell, label: "Emergency SOS Alerts" },
            { icon: Users, label: "Family Bond Messages" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span>{label}</span>
            </div>
          ))}
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
