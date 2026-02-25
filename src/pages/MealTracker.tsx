import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, UtensilsCrossed, Flame, Coffee, Sun, Moon as MoonIcon, Apple, BarChart2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
}

interface DayMeals {
  date: string;
  meals: MealEntry[];
  waterCups: number;
}

const MEAL_STORAGE_KEY = "famcare360_meals";

const COMMON_FOODS = [
  { name: "Rice (1 cup)", calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: "Chapati (1 pc)", calories: 120, protein: 3.5, carbs: 20, fat: 3.5 },
  { name: "Dal (1 cup)", calories: 180, protein: 12, carbs: 30, fat: 1.5 },
  { name: "Chicken Curry (1 cup)", calories: 280, protein: 25, carbs: 8, fat: 16 },
  { name: "Egg (boiled, 1)", calories: 78, protein: 6, carbs: 0.6, fat: 5.3 },
  { name: "Milk (1 glass)", calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: "Banana (1 medium)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Apple (1 medium)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Salad (mixed bowl)", calories: 80, protein: 3, carbs: 12, fat: 2 },
  { name: "Paneer (100g)", calories: 265, protein: 18, carbs: 1.2, fat: 20 },
  { name: "Idli (2 pcs)", calories: 130, protein: 4, carbs: 26, fat: 0.5 },
  { name: "Dosa (1 pc)", calories: 168, protein: 3.9, carbs: 27, fat: 4.5 },
  { name: "Oats (1 cup cooked)", calories: 154, protein: 5.3, carbs: 27, fat: 2.6 },
  { name: "Tea (with milk)", calories: 45, protein: 1, carbs: 5, fat: 2 },
  { name: "Coffee (with milk)", calories: 60, protein: 2, carbs: 6, fat: 3 },
  { name: "Roti (wheat, 1)", calories: 100, protein: 3, carbs: 18, fat: 2 },
];

const MEAL_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <Sun className="w-4 h-4" />,
  dinner: <MoonIcon className="w-4 h-4" />,
  snack: <Apple className="w-4 h-4" />,
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-amber-400",
  lunch: "bg-sky-400",
  dinner: "bg-indigo-400",
  snack: "bg-emerald-400",
};

const MealTracker = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [dayMeals, setDayMeals] = useState<DayMeals>({ date: today, meals: [], waterCups: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [mealType, setMealType] = useState<MealEntry["mealType"]>("breakfast");
  const [searchFood, setSearchFood] = useState("");
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(MEAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: DayMeals = JSON.parse(saved);
        if (parsed.date === today) setDayMeals(parsed);
      } catch {}
    }
  }, []);

  const save = (d: DayMeals) => {
    setDayMeals(d);
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(d));
  };

  const addFood = (food: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    const entry: MealEntry = {
      id: Date.now().toString(),
      ...food,
      mealType,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };
    save({ ...dayMeals, meals: [...dayMeals.meals, entry] });
    setShowAdd(false);
    setSearchFood("");
  };

  const addCustomFood = () => {
    if (!customName.trim() || !customCal) return;
    addFood({
      name: customName,
      calories: parseInt(customCal) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
    });
    setCustomName("");
    setCustomCal("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
  };

  const removeMeal = (id: string) => {
    save({ ...dayMeals, meals: dayMeals.meals.filter(m => m.id !== id) });
  };

  const totalCal = dayMeals.meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = dayMeals.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = dayMeals.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = dayMeals.meals.reduce((s, m) => s + m.fat, 0);
  const calGoal = 2000;

  const mealsByType = (type: MealEntry["mealType"]) => dayMeals.meals.filter(m => m.mealType === type);
  const calByType = (type: MealEntry["mealType"]) => mealsByType(type).reduce((s, m) => s + m.calories, 0);

  const filteredFoods = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(searchFood.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="gradient-hero px-6 pt-6 pb-8">
        <div className="max-w-xl mx-auto">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Meal & Calorie Tracker</h1>
              <p className="text-white/70 text-sm">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 space-y-4">
        {/* Calorie Summary */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-foreground">Today's Nutrition</h2>
            <span className="text-sm font-semibold text-primary">{totalCal} / {calGoal} kcal</span>
          </div>

          {/* Calorie ring */}
          <div className="flex items-center gap-5 mb-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={totalCal > calGoal ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth="3"
                  strokeDasharray={`${Math.min((totalCal / calGoal) * 100, 100)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-foreground">{Math.round((totalCal / calGoal) * 100)}%</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="bg-muted/30 rounded-xl p-2 text-center">
                <div className="text-lg font-bold text-primary">{Math.round(totalProtein)}g</div>
                <div className="text-[10px] text-muted-foreground">Protein</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-2 text-center">
                <div className="text-lg font-bold text-accent">{Math.round(totalCarbs)}g</div>
                <div className="text-[10px] text-muted-foreground">Carbs</div>
              </div>
              <div className="bg-muted/30 rounded-xl p-2 text-center">
                <div className="text-lg font-bold text-amber-500">{Math.round(totalFat)}g</div>
                <div className="text-[10px] text-muted-foreground">Fat</div>
              </div>
            </div>
          </div>

          {/* Water tracker */}
          <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">💧</span>
              <span className="text-sm font-medium text-foreground">Water: {dayMeals.waterCups} cups</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => save({ ...dayMeals, waterCups: Math.max(0, dayMeals.waterCups - 1) })}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-sm">-</button>
              <button onClick={() => save({ ...dayMeals, waterCups: dayMeals.waterCups + 1 })}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">+</button>
            </div>
          </div>
        </div>

        {/* Meal sections */}
        {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => (
          <div key={type} className="bg-card rounded-2xl p-4 shadow-card border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${MEAL_COLORS[type]} rounded-lg flex items-center justify-center text-white`}>
                  {MEAL_ICONS[type]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm capitalize">{type}</h3>
                  <span className="text-xs text-muted-foreground">{calByType(type)} kcal</span>
                </div>
              </div>
              <button
                onClick={() => { setMealType(type); setShowAdd(true); }}
                className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>

            {mealsByType(type).length > 0 ? (
              <div className="space-y-1.5">
                {mealsByType(type).map(meal => (
                  <div key={meal.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">{meal.name}</div>
                      <div className="text-xs text-muted-foreground">{meal.time} · P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{meal.calories}</span>
                      <button onClick={() => removeMeal(meal.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No items logged yet</p>
            )}
          </div>
        ))}

        {/* Calorie breakdown by meal */}
        <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-3">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">Calorie Breakdown</h3>
          </div>
          <div className="space-y-2">
            {(["breakfast", "lunch", "dinner", "snack"] as const).map(type => {
              const cal = calByType(type);
              const pct = totalCal > 0 ? (cal / totalCal) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground capitalize">{type}</span>
                    <span className="text-muted-foreground">{cal} kcal ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${MEAL_COLORS[type]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Food Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-card rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl border border-border">
              <div className="sticky top-0 bg-card p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-foreground">Add {mealType}</h3>
                <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
              </div>

              <div className="p-4 space-y-3">
                {/* Search common foods */}
                <Input
                  placeholder="Search food..."
                  value={searchFood}
                  onChange={e => setSearchFood(e.target.value)}
                  className="text-sm"
                />

                {searchFood && (
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {filteredFoods.map((food, i) => (
                      <button
                        key={i}
                        onClick={() => addFood(food)}
                        className="w-full flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="text-sm font-medium text-foreground">{food.name}</span>
                        <span className="text-xs text-primary font-semibold">{food.calories} kcal</span>
                      </button>
                    ))}
                    {filteredFoods.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No matching food found. Add custom below.</p>
                    )}
                  </div>
                )}

                {/* Custom food entry */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Add Custom Food</p>
                  <Input placeholder="Food name" value={customName} onChange={e => setCustomName(e.target.value)} className="text-sm mb-2" />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input placeholder="Calories" type="number" value={customCal} onChange={e => setCustomCal(e.target.value)} className="text-sm" />
                    <Input placeholder="Protein (g)" type="number" value={customProtein} onChange={e => setCustomProtein(e.target.value)} className="text-sm" />
                    <Input placeholder="Carbs (g)" type="number" value={customCarbs} onChange={e => setCustomCarbs(e.target.value)} className="text-sm" />
                    <Input placeholder="Fat (g)" type="number" value={customFat} onChange={e => setCustomFat(e.target.value)} className="text-sm" />
                  </div>
                  <Button onClick={addCustomFood} className="w-full" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Custom Food
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealTracker;
