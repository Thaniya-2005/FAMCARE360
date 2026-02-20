export type UserRole = 'parent' | 'child' | null;

export interface HealthData {
  id: string;
  date: string;
  // Mental & Emotional
  moodScore: number; // 1-5
  stressLevel: number; // 1-5
  emotionalNotes: string;
  // Food & Hydration
  mealsEaten: number; // 0-3
  waterIntake: number; // cups
  appetiteGood: boolean;
  // Sleep & Rest
  sleepHours: number;
  sleepQuality: number; // 1-5
  hadNap: boolean;
  // Sleep Breakdown (hours)
  sleepInBedTime: string; // e.g. "10:30 PM"
  deepSleepHours: number;
  lightSleepHours: number;
  remSleepHours: number;
  awakeDuringNight: number; // minutes
  // Physical Activity
  mobilityLevel: number; // 1-5
  exerciseMinutes: number;
  painLevel: number; // 0-5
  stepsCount: number;
  // Vital Signs
  heartRate: number; // bpm
  temperature: number; // °F
  // Medicines
  medicationTaken: boolean;
  bloodPressure: string;
  bloodSugar: string;
  cholesterol: string; // mg/dL
  diabetesReading: string; // mg/dL (fasting glucose)
  // Lifestyle Scores (0-100)
  dietHabitsScore: number;
  lifestyleScore: number;
  // Overall Safety
  feltSafe: boolean;
  hadFall: boolean;
  needsHelp: boolean;
  // Bonding Message
  bondingMessage: string;
  // Emergency
  sosActivated: boolean;
}

export type HealthStatus = 'stable' | 'moderate' | 'critical';

export function calculateHealthStatus(data: HealthData): HealthStatus {
  let riskScore = 0;

  if (data.moodScore <= 2) riskScore++;
  if (data.stressLevel >= 4) riskScore++;
  if (data.mealsEaten <= 1) riskScore++;
  if (data.waterIntake < 4) riskScore++;
  if (data.sleepHours < 5) riskScore++;
  if (data.sleepQuality <= 2) riskScore++;
  if (data.mobilityLevel <= 2) riskScore++;
  if (data.painLevel >= 4) riskScore++;
  if (!data.medicationTaken) riskScore++;
  if (data.hadFall) riskScore += 2;
  if (data.needsHelp) riskScore++;
  if (data.sosActivated) riskScore += 3;
  if (data.heartRate > 100 || data.heartRate < 50) riskScore++;
  if (data.temperature > 99.5 || data.temperature < 97.0) riskScore++;
  if (data.stepsCount < 1000) riskScore++;

  if (riskScore >= 5) return 'critical';
  if (riskScore >= 2) return 'moderate';
  return 'stable';
}

export function calculateLifestyleScore(data: HealthData): number {
  let score = 0;
  // Sleep (max 20)
  score += Math.min((data.sleepHours / 8) * 20, 20);
  // Mood (max 20)
  score += (data.moodScore / 5) * 20;
  // Activity (max 20)
  score += Math.min((data.stepsCount / 8000) * 10 + (data.exerciseMinutes / 30) * 10, 20);
  // Nutrition (max 20)
  score += (data.mealsEaten / 3) * 10 + (data.waterIntake / 8) * 10;
  // Safety & Medication (max 20)
  score += (data.medicationTaken ? 10 : 0) + (data.feltSafe ? 5 : 0) + (!data.hadFall ? 5 : 0);
  return Math.round(Math.min(score, 100) * 10) / 10;
}

export function getDefaultHealthData(): HealthData {
  return {
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    moodScore: 3,
    stressLevel: 2,
    emotionalNotes: '',
    mealsEaten: 3,
    waterIntake: 6,
    appetiteGood: true,
    sleepHours: 7,
    sleepQuality: 3,
    hadNap: false,
    sleepInBedTime: '10:00 PM',
    deepSleepHours: 2,
    lightSleepHours: 3,
    remSleepHours: 1.5,
    awakeDuringNight: 30,
    mobilityLevel: 3,
    exerciseMinutes: 0,
    painLevel: 0,
    stepsCount: 0,
    heartRate: 72,
    temperature: 98.6,
    cholesterol: '',
    diabetesReading: '',
    dietHabitsScore: 50,
    lifestyleScore: 50,
    medicationTaken: true,
    bloodPressure: '',
    bloodSugar: '',
    feltSafe: true,
    hadFall: false,
    needsHelp: false,
    bondingMessage: '',
    sosActivated: false,
  };
}

export const HEALTH_TIPS = [
  { emoji: "🚶", tip: "Walking 8,000 steps a day can reduce the risk of many chronic diseases." },
  { emoji: "💧", tip: "Drink at least 8 cups of water daily to stay properly hydrated." },
  { emoji: "😴", tip: "Adults aged 60+ should aim for 7–8 hours of quality sleep per night." },
  { emoji: "🧘", tip: "10 minutes of gentle stretching every morning improves mobility and mood." },
  { emoji: "🥦", tip: "Eating at least 5 servings of fruits and vegetables daily boosts immunity." },
  { emoji: "💊", tip: "Taking medications at the same time daily helps maintain steady drug levels." },
  { emoji: "❤️", tip: "A normal resting heart rate for adults is between 60–100 beats per minute." },
  { emoji: "🌡️", tip: "Normal body temperature ranges from 97°F to 99°F (36.1°C to 37.2°C)." },
  { emoji: "🧠", tip: "Social connection reduces the risk of depression and cognitive decline." },
  { emoji: "☀️", tip: "15 minutes of sunlight daily helps your body produce vitamin D naturally." },
  { emoji: "🩺", tip: "Check your blood pressure regularly — hypertension often has no symptoms." },
  { emoji: "🍎", tip: "Reducing sugar intake helps maintain steady energy levels throughout the day." },
];
