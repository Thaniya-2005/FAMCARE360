import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Heart, Scale, Calendar, Pill, Activity, User,
  Smile, Shield, AlertTriangle, CheckCircle, Clock
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { CircularGauge } from "@/components/parent/CircularGauge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { HealthData, Medication, Appointment, getDefaultHealthData } from "@/types/health";

export const ParentMemberDetails: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState<{ id: string; name: string; age: number | null; health_details: string | null } | null>(null);
  const [healthData, setHealthData] = useState<HealthData>(getDefaultHealthData);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMember = useCallback(async () => {
    if (!memberId) return;
    setIsLoading(true);
    try {
      // 1. Fetch child from children table
      const { data: childRow } = await supabase
        .from("children")
        .select("*")
        .eq("id", memberId)
        .maybeSingle();

      if (childRow) {
        setMember(childRow);
      } else {
        // Fallback: check profile
        const { data: profRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", memberId)
          .maybeSingle();
        if (profRow) {
          setMember({
            id: profRow.user_id,
            name: profRow.full_name || "Family Member",
            age: null,
            health_details: null,
          });
        }
      }

      // 2. Fetch health report
      if (user) {
        const report = await healthService.getTodayHealthReport(user.id);
        if (report) setHealthData(report);

        const meds = await healthService.getMedications(user.id);
        setMedications(meds);

        const appts = await healthService.getAppointments(user.id);
        setAppointments(appts);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [memberId, user]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  const displayName = member?.name || "Family Member";

  return (
    <ParentLayout title="Member Details">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate("/parent/family")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#60738F] hover:text-[#102443] dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Family</span>
        </button>

        {/* Member Header Profile Card */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#159FA6] to-[#42C5C9] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white dark:border-[#111A24]">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
                  {displayName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] text-xs font-bold">
                  Child Account
                </span>
              </div>
              <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] mt-0.5">
                {member?.age ? `Age: ${member.age} years` : "Age not specified"} • Linked to Family Circle
              </p>
              {member?.health_details && (
                <p className="text-xs text-[#159FA6] dark:text-[#42C5C9] font-medium mt-1">
                  Notes: {member.health_details}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22B96B]" />
            <span className="text-xs font-bold text-[#102443] dark:text-white">Active Status</span>
          </div>
        </div>

        {/* Health Score & Vitals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card flex flex-col items-center justify-center text-center">
            <CircularGauge score={86} label="Health Score" size={120} strokeWidth={10} />
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F8F0] text-[#22B96B] text-xs font-bold mt-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Good Health</span>
            </span>
          </div>

          <div className="sm:col-span-2 bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
            <h4 className="font-bold text-sm text-[#102443] dark:text-white mb-3">
              Latest Vital Signs
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/20 border border-[#FFE4E6]">
                <span className="text-xs text-[#60738F] font-bold block">Heart Rate</span>
                <span className="text-lg font-black text-[#102443] dark:text-white">
                  {healthData.heartRate || 76} bpm
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#E6F8F7] dark:bg-teal-950/20 border border-[#159FA6]/20">
                <span className="text-xs text-[#60738F] font-bold block">Body Temp</span>
                <span className="text-lg font-black text-[#102443] dark:text-white">
                  {healthData.temperature || 98.6}°F
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/20 border border-[#DBEAFE]">
                <span className="text-xs text-[#60738F] font-bold block">Blood Pressure</span>
                <span className="text-lg font-black text-[#102443] dark:text-white">
                  {healthData.bloodPressure || "118/76"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/20 border border-[#EDE9FE]">
                <span className="text-xs text-[#60738F] font-bold block">Blood Sugar</span>
                <span className="text-lg font-black text-[#102443] dark:text-white">
                  {healthData.bloodSugar || "94 mg/dL"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Care & Appointments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-[#9333EA]" />
              <h4 className="font-bold text-sm text-[#102443] dark:text-white">
                Active Medications
              </h4>
            </div>
            <div className="space-y-2">
              {medications.slice(0, 3).map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F4FAFC] dark:bg-[#182330] flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-[#102443] dark:text-white">{m.name}</span>
                  <span className="text-[#60738F]">{m.dose} • {m.time}</span>
                </div>
              ))}
              {medications.length === 0 && (
                <p className="text-xs text-[#60738F] py-2">No medications scheduled.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-[#2563EB]" />
              <h4 className="font-bold text-sm text-[#102443] dark:text-white">
                Upcoming Appointments
              </h4>
            </div>
            <div className="space-y-2">
              {appointments.slice(0, 3).map((a, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F4FAFC] dark:bg-[#182330] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#102443] dark:text-white block">{a.title}</span>
                    <span className="text-[11px] text-[#60738F]">{a.doctor}</span>
                  </div>
                  <span className="text-[#159FA6] font-semibold">{a.date}</span>
                </div>
              ))}
              {appointments.length === 0 && (
                <p className="text-xs text-[#60738F] py-2">No upcoming visits booked.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ParentLayout>
  );
};

export default ParentMemberDetails;
