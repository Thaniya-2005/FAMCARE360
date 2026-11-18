export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          role: Database["public"]["Enums"]["app_role"]
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          invite_code: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          relationship: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: Database["public"]["Enums"]["app_role"]
          relationship?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          relationship?: string | null
          created_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          parent_id: string
          family_id: string | null
          name: string
          age: number | null
          health_details: string | null
          linked_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          family_id?: string | null
          name: string
          age?: number | null
          health_details?: string | null
          linked_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          family_id?: string | null
          name?: string
          age?: number | null
          health_details?: string | null
          linked_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_reports: {
        Row: {
          id: string
          user_id: string
          family_id: string | null
          report_date: string
          heart_rate: number | null
          temperature: number | null
          steps_count: number | null
          distance_km: number | null
          active_calories: number | null
          mood_score: number | null
          stress_level: number | null
          anxiety_level: number | null
          emotional_notes: string | null
          had_social_interactions: boolean | null
          feeling_lonely: boolean | null
          outdoor_time_minutes: number | null
          meals_eaten: number | null
          ate_breakfast: boolean | null
          ate_lunch: boolean | null
          ate_dinner: boolean | null
          water_intake: number | null
          caffeine_intake: number | null
          appetite_good: boolean | null
          had_fruits_veggies: boolean | null
          took_vitamins: boolean | null
          diet_habits_score: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          had_nap: boolean | null
          wake_up_time: string | null
          sleep_in_bed_time: string | null
          deep_sleep_hours: number | null
          light_sleep_hours: number | null
          rem_sleep_hours: number | null
          awake_during_night: number | null
          felt_rested_after_sleep: boolean | null
          snoring_concerns: boolean | null
          mobility_level: number | null
          exercise_minutes: number | null
          pain_level: number | null
          did_physical_therapy: boolean | null
          did_stretching: boolean | null
          used_walking_aid: boolean | null
          medication_taken: boolean | null
          medication_side_effects: string | null
          blood_pressure: string | null
          blood_sugar: string | null
          cholesterol: string | null
          diabetes_reading: string | null
          allergies: string | null
          felt_safe: boolean | null
          had_fall: boolean | null
          needs_help: boolean | null
          home_hazards: boolean | null
          used_emergency_contact: boolean | null
          caregiver_notes: string | null
          bonding_message: string | null
          sos_activated: boolean | null
          lifestyle_score: number | null
          health_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id?: string | null
          report_date?: string
          heart_rate?: number | null
          temperature?: number | null
          steps_count?: number | null
          distance_km?: number | null
          active_calories?: number | null
          mood_score?: number | null
          stress_level?: number | null
          anxiety_level?: number | null
          emotional_notes?: string | null
          had_social_interactions?: boolean | null
          feeling_lonely?: boolean | null
          outdoor_time_minutes?: number | null
          meals_eaten?: number | null
          ate_breakfast?: boolean | null
          ate_lunch?: boolean | null
          ate_dinner?: boolean | null
          water_intake?: number | null
          caffeine_intake?: number | null
          appetite_good?: boolean | null
          had_fruits_veggies?: boolean | null
          took_vitamins?: boolean | null
          diet_habits_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          had_nap?: boolean | null
          wake_up_time?: string | null
          sleep_in_bed_time?: string | null
          deep_sleep_hours?: number | null
          light_sleep_hours?: number | null
          rem_sleep_hours?: number | null
          awake_during_night?: number | null
          felt_rested_after_sleep?: boolean | null
          snoring_concerns?: boolean | null
          mobility_level?: number | null
          exercise_minutes?: number | null
          pain_level?: number | null
          did_physical_therapy?: boolean | null
          did_stretching?: boolean | null
          used_walking_aid?: boolean | null
          medication_taken?: boolean | null
          medication_side_effects?: string | null
          blood_pressure?: string | null
          blood_sugar?: string | null
          cholesterol?: string | null
          diabetes_reading?: string | null
          allergies?: string | null
          felt_safe?: boolean | null
          had_fall?: boolean | null
          needs_help?: boolean | null
          home_hazards?: boolean | null
          used_emergency_contact?: boolean | null
          caregiver_notes?: string | null
          bonding_message?: string | null
          sos_activated?: boolean | null
          lifestyle_score?: number | null
          health_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string | null
          report_date?: string
          heart_rate?: number | null
          temperature?: number | null
          steps_count?: number | null
          distance_km?: number | null
          active_calories?: number | null
          mood_score?: number | null
          stress_level?: number | null
          anxiety_level?: number | null
          emotional_notes?: string | null
          had_social_interactions?: boolean | null
          feeling_lonely?: boolean | null
          outdoor_time_minutes?: number | null
          meals_eaten?: number | null
          ate_breakfast?: boolean | null
          ate_lunch?: boolean | null
          ate_dinner?: boolean | null
          water_intake?: number | null
          caffeine_intake?: number | null
          appetite_good?: boolean | null
          had_fruits_veggies?: boolean | null
          took_vitamins?: boolean | null
          diet_habits_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          had_nap?: boolean | null
          wake_up_time?: string | null
          sleep_in_bed_time?: string | null
          deep_sleep_hours?: number | null
          light_sleep_hours?: number | null
          rem_sleep_hours?: number | null
          awake_during_night?: number | null
          felt_rested_after_sleep?: boolean | null
          snoring_concerns?: boolean | null
          mobility_level?: number | null
          exercise_minutes?: number | null
          pain_level?: number | null
          did_physical_therapy?: boolean | null
          did_stretching?: boolean | null
          used_walking_aid?: boolean | null
          medication_taken?: boolean | null
          medication_side_effects?: string | null
          blood_pressure?: string | null
          blood_sugar?: string | null
          cholesterol?: string | null
          diabetes_reading?: string | null
          allergies?: string | null
          felt_safe?: boolean | null
          had_fall?: boolean | null
          needs_help?: boolean | null
          home_hazards?: boolean | null
          used_emergency_contact?: boolean | null
          caregiver_notes?: string | null
          bonding_message?: string | null
          sos_activated?: boolean | null
          lifestyle_score?: number | null
          health_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          id: string
          user_id: string
          heart_rate: number | null
          temperature: number | null
          blood_pressure: string | null
          blood_sugar: string | null
          cholesterol: string | null
          steps_count: number | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          heart_rate?: number | null
          temperature?: number | null
          blood_pressure?: string | null
          blood_sugar?: string | null
          cholesterol?: string | null
          steps_count?: number | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          heart_rate?: number | null
          temperature?: number | null
          blood_pressure?: string | null
          blood_sugar?: string | null
          cholesterol?: string | null
          steps_count?: number | null
          recorded_at?: string
          created_at?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          id: string
          user_id: string
          meal_date: string
          meal_type: string
          name: string
          calories: number
          protein: number
          carbs: number
          fat: number
          time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_date?: string
          meal_type: string
          name: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_date?: string
          meal_type?: string
          name?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          user_id: string
          exercise_date: string
          exercise_id: string
          name: string
          sets: Json
          total_reps: number
          calories_burned: number
          duration: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_date?: string
          exercise_id: string
          name: string
          sets?: Json
          total_reps?: number
          calories_burned?: number
          duration?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_date?: string
          exercise_id?: string
          name?: string
          sets?: Json
          total_reps?: number
          calories_burned?: number
          duration?: number
          created_at?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dose: string
          time: string
          frequency: string
          taken: boolean
          refill_needed: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dose: string
          time: string
          frequency?: string
          taken?: boolean
          refill_needed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dose?: string
          time?: string
          frequency?: string
          taken?: boolean
          refill_needed?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          title: string
          doctor: string
          date: string
          time: string | null
          notes: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          doctor: string
          date: string
          time?: string | null
          notes?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          doctor?: string
          date?: string
          time?: string | null
          notes?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          id: string
          user_id: string
          family_id: string | null
          status: string
          notes: string | null
          vital_snapshot: Json | null
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          family_id?: string | null
          status?: string
          notes?: string | null
          vital_snapshot?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          family_id?: string | null
          status?: string
          notes?: string | null
          vital_snapshot?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_family_member: {
        Args: {
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "parent" | "child"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "child"],
    },
  },
} as const
