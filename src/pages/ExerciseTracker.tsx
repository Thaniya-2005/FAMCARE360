import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Dumbbell, Play, RotateCcw, Check, Timer, Flame, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  healthService, ExerciseLogItem, DayExercises, EXERCISE_STORAGE_KEY
} from "@/services/healthService";

interface Exercise {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  caloriesPer10: number; // calories burned per 10 reps/min
  icon: string;
}

const EXERCISES: Exercise[] = [
  { id: "push-ups", name: "Push-ups", category: "Upper Body", targetMuscle: "Chest, Triceps", caloriesPer10: 8, icon: "💪" },
  { id: "squats", name: "Squats", category: "Lower Body", targetMuscle: "Quads, Glutes", caloriesPer10: 10, icon: "🦵" },
  { id: "lunges", name: "Lunges", category: "Lower Body", targetMuscle: "Quads, Hamstrings", caloriesPer10: 9, icon: "🏃" },
  { id: "plank", name: "Plank Hold", category: "Core", targetMuscle: "Abs, Back", caloriesPer10: 5, icon: "🧘" },
  { id: "burpees", name: "Burpees", category: "Full Body", targetMuscle: "Full Body", caloriesPer10: 15, icon: "⚡" },
  { id: "jumping-jacks", name: "Jumping Jacks", category: "Cardio", targetMuscle: "Full Body", caloriesPer10: 7, icon: "🤸" },
  { id: "mountain-climbers", name: "Mountain Climbers", category: "Core", targetMuscle: "Core, Shoulders", caloriesPer10: 12, icon: "🏔️" },
  { id: "bicep-curls", name: "Bicep Curls", category: "Upper Body", targetMuscle: "Biceps", caloriesPer10: 6, icon: "💪" },
  { id: "tricep-dips", name: "Tricep Dips", category: "Upper Body", targetMuscle: "Triceps", caloriesPer10: 7, icon: "🏋️" },
  { id: "crunches", name: "Crunches", category: "Core", targetMuscle: "Abs", caloriesPer10: 5, icon: "🔥" },
  { id: "lateral-raise", name: "Lateral Raises", category: "Upper Body", targetMuscle: "Shoulders", caloriesPer10: 5, icon: "🤲" },
  { id: "deadlifts", name: "Deadlifts", category: "Full Body", targetMuscle: "Back, Legs", caloriesPer10: 12, icon: "🏋️" },
  { id: "calf-raises", name: "Calf Raises", category: "Lower Body", targetMuscle: "Calves", caloriesPer10: 4, icon: "🦶" },
  { id: "high-knees", name: "High Knees", category: "Cardio", targetMuscle: "Core, Legs", caloriesPer10: 10, icon: "🏃" },
  { id: "wall-sit", name: "Wall Sit", category: "Lower Body", targetMuscle: "Quads", caloriesPer10: 6, icon: "🧱" },
  { id: "alt-dumbbell-curls", name: "Alt. Dumbbell Curls", category: "Upper Body", targetMuscle: "Biceps", caloriesPer10: 6, icon: "💪" },
];

const CATEGORIES = ["All", ...new Set(EXERCISES.map((e) => e.category))];

const ExerciseTracker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  const [dayData, setDayData] = useState<DayExercises>({
    date: today,
    logs: [],
    totalCalories: 0,
    totalDuration: 0,
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isActive, setIsActive] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState<{ reps: number; completed: boolean }[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadExercises = useCallback(async () => {
    const data = await healthService.getExercises(user?.id, today);
    setDayData(data);
  }, [user, today]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const save = (d: DayExercises) => {
    setDayData(d);
    localStorage.setItem(EXERCISE_STORAGE_KEY, JSON.stringify(d));
  };

  const startExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setIsActive(true);
    setCurrentReps(0);
    setCurrentSets([]);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
  };

  const addRep = () => setCurrentReps((r) => r + 1);

  const completeSet = () => {
    if (currentReps === 0) return;
    setCurrentSets((s) => [...s, { reps: currentReps, completed: true }]);
    setCurrentReps(0);
  };

  const finishExercise = async () => {
    if (!selectedExercise) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const allSets =
      currentReps > 0
        ? [...currentSets, { reps: currentReps, completed: true }]
        : currentSets;

    const totalReps = allSets.reduce((s, set) => s + set.reps, 0);
    const caloriesBurned = Math.round((totalReps / 10) * selectedExercise.caloriesPer10);

    const log: ExerciseLogItem = {
      exerciseId: selectedExercise.id,
      name: selectedExercise.name,
      sets: allSets,
      totalReps,
      caloriesBurned,
      duration: timer,
      timestamp: new Date().toISOString(),
    };

    const updated = {
      ...dayData,
      logs: [...dayData.logs, log],
      totalCalories: dayData.totalCalories + caloriesBurned,
      totalDuration: dayData.totalDuration + timer,
    };
    save(updated);

    if (user) {
      await healthService.saveExercise(user.id, log, today);
    }

    resetExercise();
  };

  const resetExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedExercise(null);
    setIsActive(false);
    setCurrentReps(0);
    setCurrentSets([]);
    setTimer(0);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const filtered =
    activeCategory === "All"
      ? EXERCISES
      : EXERCISES.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="gradient-hero px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Exercise Tracker</h1>
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
        {/* Day Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground mb-3">Today&apos;s Workout Stats</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-primary">{dayData.logs.length}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Exercises</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-accent">{dayData.totalCalories}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Calories Burned</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(dayData.totalDuration / 60)}m
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Total Time</div>
            </div>
          </div>
        </div>

        {/* Active Exercise Modal / Control */}
        {isActive && selectedExercise && (
          <div className="bg-card rounded-2xl p-5 shadow-card border-2 border-primary space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedExercise.icon}</span>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{selectedExercise.name}</h3>
                  <span className="text-xs text-muted-foreground">{selectedExercise.targetMuscle}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-mono font-bold text-lg px-3 py-1.5 rounded-xl">
                <Timer className="w-5 h-5" />
                {formatTime(timer)}
              </div>
            </div>

            {/* Reps and Sets */}
            <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-around">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Current Set Reps</div>
                <div className="text-4xl font-extrabold text-primary my-1">{currentReps}</div>
                <Button size="sm" onClick={addRep} className="gradient-hero text-white font-bold px-4">
                  +1 Rep
                </Button>
              </div>

              <div className="text-center border-l border-border pl-6">
                <div className="text-xs text-muted-foreground uppercase font-semibold">Completed Sets</div>
                <div className="text-2xl font-bold text-foreground my-2">{currentSets.length} sets</div>
                <Button size="sm" variant="outline" onClick={completeSet}>
                  <Check className="w-4 h-4 mr-1" /> Finish Set
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={finishExercise} className="flex-1 gradient-parent text-white font-bold h-11">
                Finish Exercise
              </Button>
              <Button variant="outline" onClick={resetExercise} className="h-11">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Exercise Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "gradient-hero text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercises List */}
        <div className="grid grid-cols-2 gap-2.5">
          {filtered.map((ex) => (
            <div
              key={ex.id}
              onClick={() => startExercise(ex)}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{ex.icon}</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                  {ex.category}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-foreground text-sm leading-tight">{ex.name}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{ex.targetMuscle}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">~{ex.caloriesPer10} cal/10</span>
                <Play className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* Today's Completed Logs */}
        {dayData.logs.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border space-y-3">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Completed Today
            </h3>
            <div className="space-y-2">
              {dayData.logs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border"
                >
                  <div>
                    <div className="font-semibold text-sm text-foreground">{log.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.sets.length} sets · {log.totalReps} total reps · {Math.round(log.duration / 60)}m
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent">+{log.caloriesBurned} kcal</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseTracker;
