import { supabase } from "@/integrations/supabase/client";
import { HealthData, Medication, Appointment } from "@/types/health";

export const HEALTH_STORAGE_KEY = "famcare360_health_data";
export const MEAL_STORAGE_KEY = "famcare360_meals";
export const EXERCISE_STORAGE_KEY = "famcare360_exercises";

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  time: string;
}

export interface DayMeals {
  date: string;
  meals: MealItem[];
  waterCups: number;
}

export interface ExerciseLogItem {
  exerciseId: string;
  name: string;
  sets: { reps: number; completed: boolean }[];
  totalReps: number;
  caloriesBurned: number;
  duration: number;
  timestamp: string;
}

export interface DayExercises {
  date: string;
  logs: ExerciseLogItem[];
  totalCalories: number;
  totalDuration: number;
}

export interface SOSAlertRecord {
  id: string;
  user_id: string;
  family_id: string | null;
  status: "active" | "acknowledged" | "resolved";
  notes?: string | null;
  vital_snapshot?: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  created_at: string;
}

// ==============================================================================
// 1. HEALTH REPORTS SERVICE
// ==============================================================================

export const healthService = {
  /**
   * Save or update today's health report in Supabase
   */
  async saveHealthReport(userId: string, data: HealthData): Promise<{ success: boolean; error?: string }> {
    try {
      const today = data.date || new Date().toISOString().split("T")[0];

      // Always update local cache as immediate safety fallback
      localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(data));

      const payload = {
        user_id: userId,
        report_date: today,
        heart_rate: data.heartRate,
        temperature: data.temperature,
        steps_count: data.stepsCount,
        distance_km: data.distanceKm,
        active_calories: data.activeCalories,
        mood_score: data.moodScore,
        stress_level: data.stressLevel,
        anxiety_level: data.anxietyLevel,
        emotional_notes: data.emotionalNotes,
        had_social_interactions: data.hadSocialInteractions,
        feeling_lonely: data.feelingLonely,
        outdoor_time_minutes: data.outdoorTimeMinutes,
        meals_eaten: data.mealsEaten,
        ate_breakfast: data.ateBreakfast,
        ate_lunch: data.ateLunch,
        ate_dinner: data.ateDinner,
        water_intake: data.waterIntake,
        caffeine_intake: data.caffeineIntake,
        appetite_good: data.appetiteGood,
        had_fruits_veggies: data.hadFruitsVeggies,
        took_vitamins: data.tookVitamins,
        diet_habits_score: data.dietHabitsScore,
        sleep_hours: data.sleepHours,
        sleep_quality: data.sleepQuality,
        had_nap: data.hadNap,
        wake_up_time: data.wakeUpTime,
        sleep_in_bed_time: data.sleepInBedTime,
        deep_sleep_hours: data.deepSleepHours,
        light_sleep_hours: data.lightSleepHours,
        rem_sleep_hours: data.remSleepHours,
        awake_during_night: data.awakeDuringNight,
        felt_rested_after_sleep: data.feltRestedAfterSleep,
        snoring_concerns: data.snoringConcerns,
        mobility_level: data.mobilityLevel,
        exercise_minutes: data.exerciseMinutes,
        pain_level: data.painLevel,
        did_physical_therapy: data.didPhysicalTherapy,
        did_stretching: data.didStretching,
        used_walking_aid: data.usedWalkingAid,
        medication_taken: data.medicationTaken,
        medication_side_effects: data.medicationSideEffects,
        blood_pressure: data.bloodPressure,
        blood_sugar: data.bloodSugar,
        cholesterol: data.cholesterol,
        diabetes_reading: data.diabetesReading,
        allergies: data.allergies,
        felt_safe: data.feltSafe,
        had_fall: data.hadFall,
        needs_help: data.needsHelp,
        home_hazards: data.homeHazards,
        used_emergency_contact: data.usedEmergencyContact,
        caregiver_notes: data.caregiverNotes,
        bonding_message: data.bondingMessage,
        sos_activated: data.sosActivated,
        lifestyle_score: data.lifestyleScore,
      };

      const { error } = await supabase
        .from("health_reports")
        .upsert(payload, { onConflict: "user_id,report_date" });

      if (error) {
        console.warn("Supabase health_reports upsert warning:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error saving health report";
      return { success: false, error: msg };
    }
  },

  /**
   * Load today's health report for a specific user (or local cache)
   */
  async getTodayHealthReport(userId?: string): Promise<HealthData | null> {
    const today = new Date().toISOString().split("T")[0];

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("health_reports")
          .select("*")
          .eq("user_id", userId)
          .eq("report_date", today)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            date: data.report_date,
            moodScore: data.mood_score ?? 3,
            stressLevel: data.stress_level ?? 2,
            anxietyLevel: data.anxiety_level ?? 2,
            emotionalNotes: data.emotional_notes ?? "",
            hadSocialInteractions: data.had_social_interactions ?? true,
            feelingLonely: data.feeling_lonely ?? false,
            outdoorTimeMinutes: data.outdoor_time_minutes ?? 0,
            mealsEaten: data.meals_eaten ?? 3,
            ateBreakfast: data.ate_breakfast ?? true,
            ateLunch: data.ate_lunch ?? true,
            ateDinner: data.ate_dinner ?? true,
            waterIntake: data.water_intake ?? 6,
            caffeineIntake: data.caffeine_intake ?? 1,
            appetiteGood: data.appetite_good ?? true,
            hadFruitsVeggies: data.had_fruits_veggies ?? true,
            tookVitamins: data.took_vitamins ?? false,
            sleepHours: Number(data.sleep_hours) || 7,
            sleepQuality: data.sleep_quality ?? 3,
            hadNap: data.had_nap ?? false,
            wakeUpTime: data.wake_up_time ?? "7:00 AM",
            sleepInBedTime: data.sleep_in_bed_time ?? "10:00 PM",
            deepSleepHours: Number(data.deep_sleep_hours) || 2,
            lightSleepHours: Number(data.light_sleep_hours) || 3,
            remSleepHours: Number(data.rem_sleep_hours) || 1.5,
            awakeDuringNight: data.awake_during_night ?? 30,
            feltRestedAfterSleep: data.felt_rested_after_sleep ?? true,
            snoringConcerns: data.snoring_concerns ?? false,
            mobilityLevel: data.mobility_level ?? 3,
            exerciseMinutes: data.exercise_minutes ?? 0,
            painLevel: data.pain_level ?? 0,
            stepsCount: data.steps_count ?? 0,
            distanceKm: Number(data.distance_km) || 0,
            activeCalories: data.active_calories ?? 0,
            didPhysicalTherapy: data.did_physical_therapy ?? false,
            didStretching: data.did_stretching ?? false,
            usedWalkingAid: data.used_walking_aid ?? false,
            heartRate: data.heart_rate ?? 72,
            temperature: Number(data.temperature) || 98.6,
            medicationTaken: data.medication_taken ?? true,
            medications: [],
            medicationSideEffects: data.medication_side_effects ?? "",
            bloodPressure: data.blood_pressure ?? "",
            bloodSugar: data.blood_sugar ?? "",
            cholesterol: data.cholesterol ?? "",
            diabetesReading: data.diabetes_reading ?? "",
            allergies: data.allergies ?? "",
            dietHabitsScore: data.diet_habits_score ?? 50,
            lifestyleScore: Number(data.lifestyle_score) || 50,
            feltSafe: data.felt_safe ?? true,
            hadFall: data.had_fall ?? false,
            needsHelp: data.needs_help ?? false,
            homeHazards: data.home_hazards ?? false,
            usedEmergencyContact: data.used_emergency_contact ?? false,
            caregiverNotes: data.caregiver_notes ?? "",
            appointments: [],
            bondingMessage: data.bonding_message ?? "",
            sosActivated: data.sos_activated ?? false,
          };
        }
      } catch (err) {
        console.warn("Supabase getTodayHealthReport failed, falling back to local storage:", err);
      }
    }

    // Fallback to local storage
    const local = localStorage.getItem(HEALTH_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed as HealthData;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Load historical health reports for trend analytics
   */
  async getHistoricalHealthReports(userId?: string, days = 7): Promise<HealthData[]> {
    if (userId) {
      try {
        const { data, error } = await supabase
          .from("health_reports")
          .select("*")
          .eq("user_id", userId)
          .order("report_date", { ascending: false })
          .limit(days);

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            date: d.report_date,
            moodScore: d.mood_score ?? 3,
            stressLevel: d.stress_level ?? 2,
            anxietyLevel: d.anxiety_level ?? 2,
            emotionalNotes: d.emotional_notes ?? "",
            hadSocialInteractions: d.had_social_interactions ?? true,
            feelingLonely: d.feeling_lonely ?? false,
            outdoorTimeMinutes: d.outdoor_time_minutes ?? 0,
            mealsEaten: d.meals_eaten ?? 3,
            ateBreakfast: d.ate_breakfast ?? true,
            ateLunch: d.ate_lunch ?? true,
            ateDinner: d.ate_dinner ?? true,
            waterIntake: d.water_intake ?? 6,
            caffeineIntake: d.caffeine_intake ?? 1,
            appetiteGood: d.appetite_good ?? true,
            hadFruitsVeggies: d.had_fruits_veggies ?? true,
            tookVitamins: d.took_vitamins ?? false,
            sleepHours: Number(d.sleep_hours) || 7,
            sleepQuality: d.sleep_quality ?? 3,
            hadNap: d.had_nap ?? false,
            wakeUpTime: d.wake_up_time ?? "",
            sleepInBedTime: d.sleep_in_bed_time ?? "",
            deepSleepHours: Number(d.deep_sleep_hours) || 2,
            lightSleepHours: Number(d.light_sleep_hours) || 3,
            remSleepHours: Number(d.rem_sleep_hours) || 1.5,
            awakeDuringNight: d.awake_during_night ?? 30,
            feltRestedAfterSleep: d.felt_rested_after_sleep ?? true,
            snoringConcerns: d.snoring_concerns ?? false,
            mobilityLevel: d.mobility_level ?? 3,
            exerciseMinutes: d.exercise_minutes ?? 0,
            painLevel: d.pain_level ?? 0,
            stepsCount: d.steps_count ?? 0,
            distanceKm: Number(d.distance_km) || 0,
            activeCalories: d.active_calories ?? 0,
            didPhysicalTherapy: d.did_physical_therapy ?? false,
            didStretching: d.did_stretching ?? false,
            usedWalkingAid: d.used_walking_aid ?? false,
            heartRate: d.heart_rate ?? 72,
            temperature: Number(d.temperature) || 98.6,
            medicationTaken: d.medication_taken ?? true,
            medications: [],
            medicationSideEffects: d.medication_side_effects ?? "",
            bloodPressure: d.blood_pressure ?? "",
            bloodSugar: d.blood_sugar ?? "",
            cholesterol: d.cholesterol ?? "",
            diabetesReading: d.diabetes_reading ?? "",
            allergies: d.allergies ?? "",
            dietHabitsScore: d.diet_habits_score ?? 50,
            lifestyleScore: Number(d.lifestyle_score) || 50,
            feltSafe: d.felt_safe ?? true,
            hadFall: d.had_fall ?? false,
            needsHelp: d.needs_help ?? false,
            homeHazards: d.home_hazards ?? false,
            usedEmergencyContact: d.used_emergency_contact ?? false,
            caregiverNotes: d.caregiver_notes ?? "",
            appointments: [],
            bondingMessage: d.bonding_message ?? "",
            sosActivated: d.sos_activated ?? false,
          }));
        }
      } catch (err) {
        console.warn("Failed fetching historical health reports:", err);
      }
    }

    // If local storage has today's record, return at least that
    const local = localStorage.getItem(HEALTH_STORAGE_KEY);
    if (local) {
      try {
        return [JSON.parse(local) as HealthData];
      } catch {
        return [];
      }
    }
    return [];
  },

  /**
   * Find linked parent ID for a child
   */
  async getLinkedParentId(childUserId: string): Promise<string | null> {
    try {
      // 1. Check children table where linked_user_id = childUserId
      const { data: childRel } = await supabase
        .from("children")
        .select("parent_id")
        .eq("linked_user_id", childUserId)
        .maybeSingle();

      if (childRel?.parent_id) return childRel.parent_id;

      // 2. Check family_members: find other parent in same family
      const { data: myFams } = await supabase
        .from("family_members")
        .select("family_id")
        .eq("user_id", childUserId);

      if (myFams && myFams.length > 0) {
        const famId = myFams[0].family_id;
        const { data: parentMember } = await supabase
          .from("family_members")
          .select("user_id")
          .eq("family_id", famId)
          .eq("role", "parent")
          .maybeSingle();

        if (parentMember?.user_id) return parentMember.user_id;

        // Check family created_by
        const { data: famInfo } = await supabase
          .from("families")
          .select("created_by")
          .eq("id", famId)
          .maybeSingle();

        if (famInfo?.created_by) return famInfo.created_by;
      }
    } catch (err) {
      console.warn("Error finding linked parent:", err);
    }
    return null;
  },

  /**
   * Find registered children for a parent
   */
  async getChildren(parentId: string): Promise<Array<{ id: string; name: string; age: number | null; linked_user_id: string | null }>> {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("id, name, age, linked_user_id")
        .eq("parent_id", parentId);
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn("Error loading children:", err);
    }
    return [];
  },

  // ==============================================================================
  // 2. MEDICATIONS SERVICE
  // ==============================================================================

  async getMedications(userId: string): Promise<Medication[]> {
    try {
      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data.map((m) => ({
          name: m.name,
          dose: m.dose,
          time: m.time,
          frequency: m.frequency,
          taken: m.taken,
          refillNeeded: m.refill_needed,
        }));
      }
    } catch (err) {
      console.warn("Error loading medications from Supabase:", err);
    }
    return [];
  },

  async addMedication(userId: string, med: Medication): Promise<boolean> {
    try {
      const { error } = await supabase.from("medications").insert({
        user_id: userId,
        name: med.name,
        dose: med.dose,
        time: med.time,
        frequency: med.frequency,
        taken: med.taken,
        refill_needed: med.refillNeeded,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteMedication(userId: string, name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("medications")
        .delete()
        .eq("user_id", userId)
        .eq("name", name);
      return !error;
    } catch {
      return false;
    }
  },

  // ==============================================================================
  // 3. APPOINTMENTS SERVICE
  // ==============================================================================

  async getAppointments(userId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

      if (!error && data) {
        return data.map((a) => ({
          title: a.title,
          doctor: a.doctor,
          date: a.date,
          time: a.time || "",
          notes: a.notes || "",
          completed: a.completed,
        }));
      }
    } catch (err) {
      console.warn("Error loading appointments from Supabase:", err);
    }
    return [];
  },

  async addAppointment(userId: string, appt: Appointment): Promise<boolean> {
    try {
      const { error } = await supabase.from("appointments").insert({
        user_id: userId,
        title: appt.title,
        doctor: appt.doctor,
        date: appt.date,
        time: appt.time || null,
        notes: appt.notes || null,
        completed: appt.completed,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteAppointment(userId: string, title: string, date: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("user_id", userId)
        .eq("title", title)
        .eq("date", date);
      return !error;
    } catch {
      return false;
    }
  },

  // ==============================================================================
  // 4. MEALS SERVICE
  // ==============================================================================

  async getMeals(userId?: string, date?: string): Promise<DayMeals> {
    const today = date || new Date().toISOString().split("T")[0];

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("meals")
          .select("*")
          .eq("user_id", userId)
          .eq("meal_date", today)
          .order("created_at", { ascending: true });

        if (!error && data) {
          const items: MealItem[] = data.map((m) => ({
            id: m.id,
            name: m.name,
            calories: m.calories,
            protein: Number(m.protein),
            carbs: Number(m.carbs),
            fat: Number(m.fat),
            mealType: m.meal_type as MealItem["mealType"],
            time: m.time || "",
          }));

          // Read water from local cache
          const local = localStorage.getItem(MEAL_STORAGE_KEY);
          let waterCups = 0;
          if (local) {
            try {
              const p = JSON.parse(local);
              if (p.date === today) waterCups = p.waterCups || 0;
            } catch {
              waterCups = 0;
            }
          }

          return { date: today, meals: items, waterCups };
        }
      } catch (err) {
        console.warn("Error loading meals from Supabase:", err);
      }
    }

    // Local storage fallback
    const local = localStorage.getItem(MEAL_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.date === today) return parsed as DayMeals;
      } catch {
        // Fallback to empty day meals on invalid JSON
      }
    }

    return { date: today, meals: [], waterCups: 0 };
  },

  async saveMeal(userId: string, meal: Omit<MealItem, "id">, date?: string): Promise<boolean> {
    try {
      const today = date || new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("meals").insert({
        user_id: userId,
        meal_date: today,
        name: meal.name,
        meal_type: meal.mealType,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        time: meal.time,
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteMeal(mealId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("meals").delete().eq("id", mealId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==============================================================================
  // 5. EXERCISES SERVICE
  // ==============================================================================

  async getExercises(userId?: string, date?: string): Promise<DayExercises> {
    const today = date || new Date().toISOString().split("T")[0];

    if (userId) {
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("user_id", userId)
          .eq("exercise_date", today)
          .order("created_at", { ascending: true });

        if (!error && data) {
          const logs: ExerciseLogItem[] = data.map((e) => ({
            exerciseId: e.exercise_id,
            name: e.name,
            sets: Array.isArray(e.sets) ? (e.sets as { reps: number; completed: boolean }[]) : [],
            totalReps: e.total_reps,
            caloriesBurned: e.calories_burned,
            duration: e.duration,
            timestamp: e.created_at,
          }));

          const totalCalories = logs.reduce((sum, l) => sum + l.caloriesBurned, 0);
          const totalDuration = logs.reduce((sum, l) => sum + l.duration, 0);

          return { date: today, logs, totalCalories, totalDuration };
        }
      } catch (err) {
        console.warn("Error loading exercises from Supabase:", err);
      }
    }

    // Local storage fallback
    const local = localStorage.getItem(EXERCISE_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.date === today) return parsed as DayExercises;
      } catch {
        // Fallback to empty day exercises on invalid JSON
      }
    }

    return { date: today, logs: [], totalCalories: 0, totalDuration: 0 };
  },

  async saveExercise(userId: string, exercise: ExerciseLogItem, date?: string): Promise<boolean> {
    try {
      const today = date || new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("exercises").insert({
        user_id: userId,
        exercise_date: today,
        exercise_id: exercise.exerciseId,
        name: exercise.name,
        sets: exercise.sets,
        total_reps: exercise.totalReps,
        calories_burned: exercise.caloriesBurned,
        duration: exercise.duration,
      });
      return !error;
    } catch {
      return false;
    }
  },

  // ==============================================================================
  // 6. EMERGENCY SOS SERVICE
  // ==============================================================================

  async triggerEmergencySOS(
    userId: string,
    vitalsSnapshot?: Record<string, unknown>
  ): Promise<{ success: boolean; alertId?: string; isSmsConfigured: boolean; error?: string }> {
    try {
      // 1. Record alert in sos_alerts
      const { data, error } = await supabase
        .from("sos_alerts")
        .insert({
          user_id: userId,
          status: "active",
          vital_snapshot: vitalsSnapshot || null,
        })
        .select()
        .single();

      if (error) {
        console.warn("Failed recording SOS alert in database:", error.message);
      }

      // 2. Dispatch notifications to family members in notifications table
      try {
        // A. Insert notification record for the initiator
        await supabase.from("notifications").insert({
          user_id: userId,
          title: "🚨 Emergency SOS Broadcast Sent",
          message: "An emergency SOS alert was triggered from your device and logged to your family network.",
          type: "sos",
          link: "/child",
        });

        // B. Dispatch high-priority notification to linked parent / guardians
        const parentId = await this.getLinkedParentId(userId);
        if (parentId && parentId !== userId) {
          await this.sendNotification(parentId, {
            title: "🚨 EMERGENCY SOS: Family Alert!",
            message: "Emergency SOS was activated by your child! Check vitals and incident report immediately.",
            type: "sos",
            link: "/parent",
          });
        }
      } catch (notifyErr) {
        console.warn("Could not write SOS notification:", notifyErr);
      }

      // External SMS delivery must run through a protected backend Edge Function
      // rather than exposing secret API keys or Account SIDs in client VITE_ variables.
      let isSmsConfigured = false;
      try {
        const edgeRes = await supabase.functions.invoke("send-emergency-sms", {
          body: { userId, alertId: data?.id, vitalsSnapshot },
        });
        if (edgeRes.data && !edgeRes.error) {
          isSmsConfigured = true;
        }
      } catch {
        // Edge function unconfigured; in-app and dashboard alerts remain fully active
        isSmsConfigured = false;
      }

      return {
        success: true,
        alertId: data?.id,
        isSmsConfigured,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error triggering SOS";
      return { success: false, isSmsConfigured: false, error: msg };
    }
  },

  async resolveEmergencySOS(sosId: string, resolvedByUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedByUserId,
        })
        .eq("id", sosId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==============================================================================
  // 7. SAFE LOCAL STORAGE TO SUPABASE MIGRATION
  // ==============================================================================

  /**
   * Safely migrates existing localStorage health, meals, and exercise data to Supabase
   * with duplicate prevention and safe resume capabilities.
   */
  async migrateLocalStorageToSupabase(userId: string): Promise<void> {
    const migrationFlagKey = `famcare360_migrated_${userId}`;
    const alreadyMigrated = localStorage.getItem(migrationFlagKey) === "completed";

    try {
      // 1. Migrate Health Data (upsert via onConflict is idempotent)
      const localHealth = localStorage.getItem(HEALTH_STORAGE_KEY);
      if (localHealth) {
        try {
          const parsed = JSON.parse(localHealth) as HealthData;
          if (parsed && parsed.date) {
            await this.saveHealthReport(userId, parsed);
          }
        } catch (err) {
          console.warn("Could not parse local health data for migration:", err);
        }
      }

      // If meals and exercises were already migrated for this user, do not duplicate
      if (alreadyMigrated) {
        return;
      }

      // 2. Migrate Meals (check existing to avoid duplicates)
      const localMeals = localStorage.getItem(MEAL_STORAGE_KEY);
      if (localMeals) {
        try {
          const parsed = JSON.parse(localMeals) as DayMeals;
          if (parsed && parsed.meals && parsed.meals.length > 0) {
            const remoteDay = await this.getMeals(userId, parsed.date);
            const existingNames = new Set(remoteDay.meals.map((m) => m.name.toLowerCase()));

            for (const m of parsed.meals) {
              if (!existingNames.has(m.name.toLowerCase())) {
                await this.saveMeal(userId, m, parsed.date);
              }
            }
          }
        } catch (err) {
          console.warn("Could not parse local meals for migration:", err);
        }
      }

      // 3. Migrate Exercises (check existing to avoid duplicates)
      const localExercises = localStorage.getItem(EXERCISE_STORAGE_KEY);
      if (localExercises) {
        try {
          const parsed = JSON.parse(localExercises) as DayExercises;
          if (parsed && parsed.logs && parsed.logs.length > 0) {
            const remoteEx = await this.getExercises(userId, parsed.date);
            const existingIds = new Set(remoteEx.logs.map((e) => e.exerciseId));

            for (const e of parsed.logs) {
              if (!existingIds.has(e.exerciseId)) {
                await this.saveExercise(userId, e, parsed.date);
              }
            }
          }
        } catch (err) {
          console.warn("Could not parse local exercises for migration:", err);
        }
      }

      // Mark migration as completed for this user
      localStorage.setItem(migrationFlagKey, "completed");
    } catch (err) {
      console.warn("Safe data migration note:", err);
    }
  },

  // ==============================================================================
  // 8. NOTIFICATION SERVICE
  // ==============================================================================

  /**
   * Fetch all notifications for a specific user
   */
  async getNotifications(userId: string): Promise<NotificationRecord[]> {
    const storageKey = `famcare360_notifications_${userId}`;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const records: NotificationRecord[] = data.map((n) => ({
          id: n.id,
          user_id: n.user_id,
          title: n.title,
          message: n.message,
          type: n.type,
          read: Boolean(n.read),
          link: n.link || null,
          created_at: n.created_at,
        }));
        try {
          localStorage.setItem(storageKey, JSON.stringify(records));
        } catch (err) {
          console.warn("Local storage notification cache note:", err);
        }
        return records;
      }
    } catch (err) {
      console.warn("Could not query notifications from Supabase:", err);
    }

    // LocalStorage fallback for offline resilience
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        return JSON.parse(cached) as NotificationRecord[];
      }
    } catch (err) {
      console.warn("Local storage parse note:", err);
    }

    return [];
  },

  /**
   * Get unread notification count for badge display
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (!error && typeof count === "number") {
        return count;
      }
    } catch (err) {
      console.warn("Could not count unread notifications:", err);
    }

    try {
      const cached = localStorage.getItem(`famcare360_notifications_${userId}`);
      if (cached) {
        const list = JSON.parse(cached) as NotificationRecord[];
        return list.filter((n) => !n.read).length;
      }
    } catch (err) {
      console.warn("Local storage count note:", err);
    }

    return 0;
  },

  /**
   * Mark an individual notification as read
   */
  async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Send a notification to a family member (verifies family permissions via RLS or RPC)
   */
  async sendNotification(
    recipientUserId: string,
    notification: {
      title: string;
      message: string;
      type?: string;
      link?: string;
    }
  ): Promise<boolean> {
    try {
      // 1. Try secure database function if available
      const { error: rpcErr } = await supabase.rpc(
        "send_family_notification",
        {
          p_recipient_user_id: recipientUserId,
          p_title: notification.title,
          p_message: notification.message,
          p_type: notification.type || "info",
          p_link: notification.link || null,
        }
      );

      let success = false;
      if (!rpcErr) {
        success = true;
      } else {
        // 2. Direct INSERT fallback (authorized by family INSERT RLS policy)
        const { error: insertErr } = await supabase.from("notifications").insert({
          user_id: recipientUserId,
          title: notification.title,
          message: notification.message,
          type: notification.type || "info",
          link: notification.link || null,
        });

        success = !insertErr;
      }

      // 3. Dispatch Web Push Notification asynchronously via Edge Function
      if (success) {
        try {
          supabase.functions
            .invoke("send-push-notification", {
              body: {
                targetUserId: recipientUserId,
                title: notification.title,
                body: notification.message,
                type: notification.type || "info",
                link: notification.link || "",
              },
            })
            .then(({ data, error }) => {
              if (error) {
                console.warn("[FCM] Edge function dispatch note:", error.message);
              } else if (data) {
                console.log("[FCM] Push dispatched successfully:", data.sentCount, "device(s)");
              }
            })
            .catch((pushErr) => {
              console.warn("[FCM] Push dispatch non-blocking notice:", pushErr);
            });
        } catch (edgeErr) {
          console.warn("[FCM] Edge function invoke attempt warning:", edgeErr);
        }
      }

      return success;
    } catch (err) {
      console.warn("sendNotification warning:", err);
      return false;
    }
  },

  /**
   * Helper: Notify linked parent when child completes check-in
   */
  async notifyParentOfCheckIn(childUserId: string, childName: string, category: string): Promise<void> {
    try {
      const parentId = await this.getLinkedParentId(childUserId);
      if (parentId && parentId !== childUserId) {
        await this.sendNotification(parentId, {
          title: `🌟 ${childName} logged daily ${category}`,
          message: `${childName} updated their daily wellness check-in for ${category}.`,
          type: "care",
          link: "/parent/care",
        });
      }
    } catch (err) {
      console.warn("Could not dispatch check-in notification to parent:", err);
    }
  },

  /**
   * Helper: Notify child when parent updates health record or vitals
   */
  async notifyChildOfHealthRecord(childUserId: string, recordType: string): Promise<void> {
    try {
      await this.sendNotification(childUserId, {
        title: "📋 New Health Record Added",
        message: `A new health record (${recordType}) was updated by your parent.`,
        type: "health",
        link: "/child/health",
      });
    } catch (err) {
      console.warn("Could not dispatch health record notification to child:", err);
    }
  },

  /**
   * Helper: Notify child when parent adds/changes medication
   */
  async notifyChildOfMedication(childUserId: string, medName: string, dose: string, time: string): Promise<void> {
    try {
      await this.sendNotification(childUserId, {
        title: "💊 Medication Reminder Set",
        message: `Your medication schedule was updated: ${medName} (${dose}) at ${time}.`,
        type: "medication",
        link: "/child/medicines",
      });
    } catch (err) {
      console.warn("Could not dispatch medication notification to child:", err);
    }
  },

  /**
   * Helper: Notify child when parent adds/changes appointment
   */
  async notifyChildOfAppointment(childUserId: string, title: string, doctor: string, date: string, time: string): Promise<void> {
    try {
      await this.sendNotification(childUserId, {
        title: "📅 New Appointment Scheduled",
        message: `${title} with ${doctor} on ${date} at ${time}.`,
        type: "appointment",
        link: "/child/appointments",
      });
    } catch (err) {
      console.warn("Could not dispatch appointment notification to child:", err);
    }
  },
};
