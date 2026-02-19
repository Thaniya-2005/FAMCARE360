export type UserRole = 'parent' | 'child' | null;

export interface HealthData {
  id: string;
  date: string;
  // Mental & Emotional
  moodScore: number; // 1-5
  stressLevel: number; // 1-5
  emotionalNotes: string;
  // Food & Hydration
  mealsEaten: number; // 1-3
  waterIntake: number; // cups
  appetiteGood: boolean;
  // Sleep & Rest
  sleepHours: number;
  sleepQuality: number; // 1-5
  hadNap: boolean;
  // Physical Activity
  mobilityLevel: number; // 1-5
  exerciseMinutes: number;
  painLevel: number; // 0-5
  // Medicines
  medicationTaken: boolean;
  bloodPressure: string;
  bloodSugar: string;
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

  if (riskScore >= 5) return 'critical';
  if (riskScore >= 2) return 'moderate';
  return 'stable';
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
    mobilityLevel: 3,
    exerciseMinutes: 0,
    painLevel: 0,
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
