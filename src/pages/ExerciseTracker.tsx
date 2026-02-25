import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, Play, RotateCcw, Check, Timer, Flame, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Exercise {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  caloriesPer10: number; // calories burned per 10 reps/min
  icon: string;
}

interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: { reps: number; completed: boolean }[];
  totalReps: number;
  caloriesBurned: number;
  duration: number; // seconds
  timestamp: string;
}

interface DayExercises {
  date: string;
  logs: ExerciseLog[];
  totalCalories: number;
  totalDuration: number;
}

const EXERCISE_STORAGE_KEY = "famcare360_exercises";

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

const CATEGORIES = [...new Set(EXERCISES.map(e => e.category))];

const ExerciseTracker = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [dayData, setDayData] = useState<DayExercises>({ date: today, logs: [], totalCalories: 0, totalDuration: 0 });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isActive, setIsActive] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentSets, setCurrentSets] = useState<{ reps: number; completed: boolean }[]>([]);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(EXERCISE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: DayExercises = JSON.parse(saved);
        if (parsed.date === today) setDayData(parsed);
      } catch {}
    }
  }, []);

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
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const addRep = () => setCurrentReps(r => r + 1);

  const completeSet = () => {
    if (currentReps === 0) return;
    setCurrentSets(s => [...s, { reps: currentReps, completed: true }]);
    setCurrentReps(0);
  };

  const finishExercise = () => {
    if (!selectedExercise) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const allSets = currentReps > 0
      ? [...currentSets, { reps: currentReps, completed: true }]
      : currentSets;
    
    const totalReps = allSets.reduce((s, set) => s + set.reps, 0);
    const caloriesBurned = Math.round((totalReps / 10) * selectedExercise.caloriesPer10);

    const log: ExerciseLog = {
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

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const filtered = activeCategory === "All" ? EXERCISES : EXERCISES.filter(e => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="gradient-hero px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Exercise Tracker</h1>
              <p className="text-white/70 text-sm">Select, track reps & burn calories</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 space-y-4">
        {/* Today's Stats */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <h2 className="font-bold text-foreground mb-3">Today's Workout Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <Flame className="w-5 h-5 text-accent mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{dayData.totalCalories}</div>
              <div className="text-[10px] text-muted-foreground">Calories</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <Timer className="w-5 h-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{formatTime(dayData.totalDuration)}</div>
              <div className="text-[10px] text-muted-foreground">Duration</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{dayData.logs.length}</div>
              <div className="text-[10px] text-muted-foreground">Exercises</div>
            </div>
          </div>
        </div>

        {/* Active Exercise Session */}
        {isActive && selectedExercise && (
          <div className="bg-card rounded-2xl p-5 shadow-card border-2 border-primary">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{selectedExercise.icon}</div>
              <h2 className="font-bold text-foreground text-lg">{selectedExercise.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedExercise.targetMuscle}</p>
            </div>

            {/* Timer */}
            <div className="text-center mb-4">
              <div className="text-3xl font-mono font-bold text-primary">{formatTime(timer)}</div>
            </div>

            {/* Rep counter */}
            <div className="bg-muted/30 rounded-xl p-4 mb-4">
              <div className="text-center mb-3">
                <div className="text-sm font-semibold text-muted-foreground">REPS</div>
                <div className="text-5xl font-bold text-foreground">{currentReps}</div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addRep} className="flex-1 gradient-hero text-white font-bold text-lg py-6">
                  +1 Rep
                </Button>
                <Button onClick={completeSet} variant="outline" className="flex-1 font-bold text-lg py-6">
                  End Set
                </Button>
              </div>
            </div>

            {/* Completed sets */}
            {currentSets.length > 0 && (
              <div className="mb-4 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Completed Sets</div>
                {currentSets.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-1.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm text-foreground">Set {i + 1}: {s.reps} reps</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={finishExercise} className="flex-1 bg-primary text-primary-foreground font-bold">
                <Check className="w-4 h-4 mr-1" /> Finish Exercise
              </Button>
              <Button onClick={resetExercise} variant="destructive" size="icon">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Exercise Selection */}
        {!isActive && (
          <>
            <div className="bg-card rounded-2xl p-4 shadow-card border border-border">
              <h3 className="font-bold text-foreground mb-3">Select Exercise</h3>
              {/* Category filter */}
              <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === "All" ? "gradient-hero text-white" : "bg-muted text-muted-foreground"
                  }`}
                >All</button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeCategory === cat ? "gradient-hero text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >{cat}</button>
                ))}
              </div>

              {/* Exercise list */}
              <div className="space-y-2">
                {filtered.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => startExercise(ex)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      {ex.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">{ex.name}</div>
                      <div className="text-xs text-muted-foreground">{ex.targetMuscle}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-semibold">
                      <Play className="w-3 h-3" /> Start
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise History */}
            {dayData.logs.length > 0 && (
              <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground">Today's Exercise Log</h3>
                </div>
                <div className="space-y-2">
                  {dayData.logs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2.5">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{log.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {log.sets.length} sets · {log.totalReps} reps · {formatTime(log.duration)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-accent">{log.caloriesBurned} kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ExerciseTracker;
