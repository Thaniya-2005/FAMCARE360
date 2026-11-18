import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, Target, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WorkoutDay {
  day: string;
  exercises: { name: string; sets: number; reps: string; rest: string }[];
}

const BMI_CATEGORIES = [
  { range: [0, 18.5], label: "Underweight", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-950/30", emoji: "🔵" },
  { range: [18.5, 25], label: "Normal", color: "text-primary", bg: "bg-primary/5", emoji: "🟢" },
  { range: [25, 30], label: "Overweight", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30", emoji: "🟡" },
  { range: [30, 100], label: "Obese", color: "text-destructive", bg: "bg-destructive/5", emoji: "🔴" },
];

function generateWorkoutPlan(goal: string, level: string, bmi: number): WorkoutDay[] {
  const isBeginning = level === "sedentary" || level === "light";
  
  const plans: Record<string, WorkoutDay[]> = {
    "weight-loss": [
      {
        day: "Monday - Cardio + Core",
        exercises: [
          { name: "Brisk Walking / Jogging", sets: 1, reps: isBeginning ? "20 min" : "30 min", rest: "-" },
          { name: "Jumping Jacks", sets: 3, reps: isBeginning ? "15" : "25", rest: "30s" },
          { name: "Mountain Climbers", sets: 3, reps: isBeginning ? "10" : "20", rest: "30s" },
          { name: "Plank Hold", sets: 3, reps: isBeginning ? "20s" : "45s", rest: "30s" },
          { name: "Bicycle Crunches", sets: 3, reps: isBeginning ? "12" : "20", rest: "30s" },
        ],
      },
      {
        day: "Wednesday - Full Body",
        exercises: [
          { name: "Squats", sets: 3, reps: isBeginning ? "12" : "20", rest: "45s" },
          { name: "Push-ups", sets: 3, reps: isBeginning ? "8" : "15", rest: "45s" },
          { name: "Lunges (each leg)", sets: 3, reps: isBeginning ? "10" : "15", rest: "45s" },
          { name: "Burpees", sets: 3, reps: isBeginning ? "5" : "12", rest: "60s" },
          { name: "High Knees", sets: 3, reps: isBeginning ? "20s" : "40s", rest: "30s" },
        ],
      },
      {
        day: "Friday - HIIT",
        exercises: [
          { name: "Sprint Intervals", sets: 1, reps: isBeginning ? "15 min" : "25 min", rest: "-" },
          { name: "Box Jumps / Step-ups", sets: 3, reps: isBeginning ? "8" : "15", rest: "45s" },
          { name: "Kettlebell Swings", sets: 3, reps: isBeginning ? "10" : "20", rest: "45s" },
          { name: "Battle Ropes / Jump Rope", sets: 3, reps: isBeginning ? "20s" : "40s", rest: "30s" },
        ],
      },
    ],
    "muscle-gain": [
      {
        day: "Monday - Upper Body Push",
        exercises: [
          { name: "Bench Press / Push-ups", sets: 4, reps: isBeginning ? "8" : "12", rest: "90s" },
          { name: "Overhead Press", sets: 3, reps: isBeginning ? "8" : "12", rest: "90s" },
          { name: "Incline Dumbbell Press", sets: 3, reps: isBeginning ? "10" : "12", rest: "60s" },
          { name: "Tricep Dips", sets: 3, reps: isBeginning ? "8" : "15", rest: "60s" },
          { name: "Lateral Raises", sets: 3, reps: isBeginning ? "10" : "15", rest: "45s" },
        ],
      },
      {
        day: "Wednesday - Legs",
        exercises: [
          { name: "Barbell Squats", sets: 4, reps: isBeginning ? "8" : "12", rest: "90s" },
          { name: "Romanian Deadlifts", sets: 3, reps: isBeginning ? "8" : "12", rest: "90s" },
          { name: "Leg Press", sets: 3, reps: isBeginning ? "10" : "15", rest: "60s" },
          { name: "Calf Raises", sets: 4, reps: isBeginning ? "12" : "20", rest: "45s" },
          { name: "Leg Curls", sets: 3, reps: isBeginning ? "10" : "12", rest: "60s" },
        ],
      },
      {
        day: "Friday - Upper Body Pull",
        exercises: [
          { name: "Pull-ups / Lat Pulldown", sets: 4, reps: isBeginning ? "6" : "12", rest: "90s" },
          { name: "Barbell Rows", sets: 3, reps: isBeginning ? "8" : "12", rest: "90s" },
          { name: "Bicep Curls", sets: 3, reps: isBeginning ? "10" : "15", rest: "60s" },
          { name: "Face Pulls", sets: 3, reps: isBeginning ? "12" : "15", rest: "45s" },
          { name: "Hammer Curls", sets: 3, reps: isBeginning ? "10" : "12", rest: "45s" },
        ],
      },
    ],
    "stay-fit": [
      {
        day: "Monday - Cardio + Flexibility",
        exercises: [
          { name: "Light Jogging / Walking", sets: 1, reps: "25 min", rest: "-" },
          { name: "Yoga Sun Salutation", sets: 3, reps: "5 flows", rest: "-" },
          { name: "Dynamic Stretching", sets: 1, reps: "10 min", rest: "-" },
          { name: "Core Planks", sets: 3, reps: "30s", rest: "30s" },
        ],
      },
      {
        day: "Wednesday - Strength Maintenance",
        exercises: [
          { name: "Squats", sets: 3, reps: "12", rest: "60s" },
          { name: "Push-ups", sets: 3, reps: "12", rest: "60s" },
          { name: "Dumbbell Rows", sets: 3, reps: "12", rest: "60s" },
          { name: "Shoulder Press", sets: 3, reps: "10", rest: "60s" },
          { name: "Plank Hold", sets: 3, reps: "30s", rest: "30s" },
        ],
      },
      {
        day: "Friday - Active Recovery",
        exercises: [
          { name: "Swimming / Cycling", sets: 1, reps: "30 min", rest: "-" },
          { name: "Foam Rolling", sets: 1, reps: "10 min", rest: "-" },
          { name: "Gentle Stretching", sets: 1, reps: "15 min", rest: "-" },
        ],
      },
    ],
    "improve-endurance": [
      {
        day: "Monday - Long Cardio",
        exercises: [
          { name: "Running / Cycling", sets: 1, reps: isBeginning ? "20 min" : "40 min", rest: "-" },
          { name: "Cool Down Walk", sets: 1, reps: "5 min", rest: "-" },
          { name: "Stretching", sets: 1, reps: "10 min", rest: "-" },
        ],
      },
      {
        day: "Wednesday - Interval Training",
        exercises: [
          { name: "Sprint 30s / Walk 60s", sets: isBeginning ? 6 : 10, reps: "1 cycle", rest: "walk" },
          { name: "Stair Climbing", sets: 3, reps: isBeginning ? "3 min" : "5 min", rest: "60s" },
          { name: "Jump Rope", sets: 3, reps: isBeginning ? "1 min" : "3 min", rest: "45s" },
        ],
      },
      {
        day: "Friday - Cross Training",
        exercises: [
          { name: "Swimming / Rowing", sets: 1, reps: isBeginning ? "15 min" : "30 min", rest: "-" },
          { name: "Bodyweight Circuit", sets: 3, reps: "10 each", rest: "60s" },
          { name: "Cool Down & Stretch", sets: 1, reps: "10 min", rest: "-" },
        ],
      },
    ],
  };

  return plans[goal] || plans["stay-fit"];
}

const BMICalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutDay[] | null>(null);
  const [tdee, setTdee] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const a = parseInt(age);
    if (!h || !w || !a || !gender || !activityLevel || !fitnessGoal) {
      toast({
        title: "Please complete all fields",
        description: "Age, gender, height, weight, activity level, and fitness goal are required.",
        variant: "destructive",
      });
      return;
    }

    const bmiVal = w / (h * h);
    setBmi(Math.round(bmiVal * 10) / 10);

    // Calculate BMR (Mifflin-St Jeor)
    let bmr: number;
    if (gender === "male") {
      bmr = 10 * w + 6.25 * parseFloat(height) - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * parseFloat(height) - 5 * a - 161;
    }

    const multipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      "very-active": 1.9,
    };
    setTdee(Math.round(bmr * (multipliers[activityLevel] || 1.2)));
    setWorkoutPlan(generateWorkoutPlan(fitnessGoal, activityLevel, bmiVal));
  };

  const getBmiCategory = (v: number) => BMI_CATEGORIES.find(c => v >= c.range[0] && v < c.range[1]) || BMI_CATEGORIES[1];
  const cat = bmi ? getBmiCategory(bmi) : null;

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="gradient-hero px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">BMI & Workout Planner</h1>
              <p className="text-white/70 text-sm">Calculate BMI & get personalized workout</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 space-y-4">
        {/* BMI Form */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-foreground text-base">Your Details</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Age</label>
              <Input type="number" placeholder="Enter your age" value={age} onChange={e => setAge(e.target.value)} className="text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 text-foreground"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Height (cm)</label>
                <Input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Weight (kg)</label>
                <Input type="number" placeholder="e.g. 70" value={weight} onChange={e => setWeight(e.target.value)} className="text-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Activity Level</label>
              <select
                value={activityLevel}
                onChange={e => setActivityLevel(e.target.value)}
                className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 text-foreground"
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
                <option value="very-active">Extra Active (athlete level)</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={e => setFitnessGoal(e.target.value)}
                className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 text-foreground"
              >
                <option value="">Select Goal</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="stay-fit">Stay Fit & Healthy</option>
                <option value="improve-endurance">Improve Endurance</option>
              </select>
            </div>

            <Button onClick={calculateBMI} className="w-full gradient-hero text-white font-bold py-3 rounded-xl">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate BMI & Generate Plan
            </Button>
          </div>
        </div>

        {/* BMI Result */}
        {bmi !== null && cat && (
          <div className={`rounded-2xl p-5 shadow-card border border-border ${cat.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-bold text-foreground text-base">Your Results</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <div className={`text-3xl font-bold ${cat.color}`}>{bmi}</div>
                <div className="text-xs text-muted-foreground mt-1">BMI</div>
                <div className={`text-xs font-semibold mt-0.5 ${cat.color}`}>{cat.emoji} {cat.label}</div>
              </div>
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <div className="text-3xl font-bold text-primary">{tdee}</div>
                <div className="text-xs text-muted-foreground mt-1">Daily Calories</div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5">TDEE (kcal)</div>
              </div>
              <div className="bg-card rounded-xl p-3 text-center border border-border">
                <div className="text-3xl font-bold text-accent">
                  {fitnessGoal === "weight-loss" ? (tdee! - 500) : fitnessGoal === "muscle-gain" ? (tdee! + 300) : tdee}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Target Cal</div>
                <div className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {fitnessGoal === "weight-loss" ? "Deficit" : fitnessGoal === "muscle-gain" ? "Surplus" : "Maintain"}
                </div>
              </div>
            </div>

            {/* BMI Scale */}
            <div className="bg-card rounded-xl p-3 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-2">BMI Scale</div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                <div className="flex-1 bg-sky-400" />
                <div className="flex-1 bg-primary" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-destructive" />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Under</span>
                <span>Normal</span>
                <span>Over</span>
                <span>Obese</span>
              </div>
              <div
                className="relative h-0"
                style={{ top: "-22px" }}
              >
                <div
                  className="absolute w-0.5 h-5 bg-foreground rounded"
                  style={{ left: `${Math.min(Math.max((bmi / 40) * 100, 2), 98)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Workout Plan */}
        {workoutPlan && (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-foreground text-base">Weekly Workout Plan</h2>
                <p className="text-xs text-muted-foreground">Personalized for your goal: {fitnessGoal.replace("-", " ")}</p>
              </div>
            </div>

            <div className="space-y-4">
              {workoutPlan.map((day, di) => (
                <div key={di} className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                      <Dumbbell className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{day.day}</h3>
                  </div>
                  <div className="space-y-2">
                    {day.exercises.map((ex, ei) => (
                      <div key={ei} className="flex items-center justify-between bg-card rounded-lg px-3 py-2 border border-border">
                        <div>
                          <div className="text-sm font-medium text-foreground">{ex.name}</div>
                          <div className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps}</div>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          Rest: {ex.rest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Rest 1-2 days between sessions. Stay hydrated and warm up 5 min before each workout. Adjust reps as you progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
