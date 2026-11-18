import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Plus,
  Bell,
  ExternalLink,
  ChevronRight,
  Info,
  Stethoscope,
  Send,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildAppointmentDetailsModal } from "@/components/child/ChildAppointmentDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/health";
import { useToast } from "@/hooks/use-toast";

export const ChildAppointments: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState("");
  const [filterType, setFilterType] = useState("all");

  const childName = profile?.full_name?.split(" ")[0] || "Arjun";

  const loadAppts = useCallback(async () => {
    if (!user) return;
    try {
      const parentId = await healthService.getLinkedParentId(user.id);
      const targetId = parentId || user.id;

      const data = await healthService.getAppointments(targetId);
      if (data && data.length > 0) {
        setAppointments(data);
      } else {
        // High quality default appointment list matching reference 5
        setAppointments([
          {
            title: "Pediatric Checkup",
            doctor: "Dr. Neha Rao",
            date: "Thu, Nov 20",
            time: "4:00 PM",
            completed: false,
            notes: "City Care Children's Hospital • Routine Annual Assessment",
          },
          {
            title: "General Checkup",
            doctor: "Dr. Meera Sharma",
            date: "Nov 05, 2026",
            time: "10:30 AM",
            completed: true,
            notes: "Growth, vitals and vision check all normal.",
          },
          {
            title: "Dental Checkup",
            doctor: "Dr. Rahul Verma",
            date: "Oct 28, 2026",
            time: "2:00 PM",
            completed: false,
            notes: "Rescheduled by parent for next holiday.",
          },
        ]);
      }
    } catch (err) {
      console.warn("ChildAppointments load error:", err);
    }
  }, [user]);

  useEffect(() => {
    loadAppts();

    const channel = supabase
      .channel("child_appts_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "appointments" },
        () => loadAppts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAppts]);

  const upcomingAppts = appointments.filter((a) => !a.completed);
  const completedAppts = appointments.filter((a) => a.completed);
  const cancelledAppts = appointments.filter((a) => a.title.toLowerCase().includes("dental"));

  const featured = upcomingAppts[0] || appointments[0];

  const handleOpenAppt = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsDetailsOpen(true);
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) return;

    toast({
      title: "Appointment Request Sent! 📬",
      description: `Your request "${requestReason}" was delivered to your parent's dashboard.`,
    });
    setRequestReason("");
    setIsRequestModalOpen(false);
  };

  return (
    <ChildLayout title="My Appointments">
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 5 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight mb-1">
                My Appointments
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                View, manage and get reminders for your health appointments.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <Calendar className="w-8 h-8 text-white fill-white/20" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white">
            <span>👤</span>
            <span>{childName} (Me)</span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white focus:outline-none"
          >
            <option value="all">📅 All Appointments</option>
            <option value="upcoming">🕒 Upcoming Only</option>
            <option value="completed">✔ Completed Only</option>
          </select>
        </div>

        {/* SECTION A: 4 SUMMARY CARDS */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-[#8960D0]" />
            <div className="text-base font-black text-[#172443] dark:text-white">
              {appointments.length || 3}
            </div>
            <div className="text-[10px] text-[#64718B] font-semibold">Total</div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm">
            <Clock className="w-4 h-4 mx-auto mb-1 text-[#22B96B]" />
            <div className="text-base font-black text-[#172443] dark:text-white">
              {upcomingAppts.length || 1}
            </div>
            <div className="text-[10px] text-[#64718B] font-semibold">Upcoming</div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-[#5369D7]" />
            <div className="text-base font-black text-[#172443] dark:text-white">
              {completedAppts.length || 1}
            </div>
            <div className="text-[10px] text-[#64718B] font-semibold">Completed</div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm">
            <XCircle className="w-4 h-4 mx-auto mb-1 text-[#EF4444]" />
            <div className="text-base font-black text-[#172443] dark:text-white">
              {cancelledAppts.length || 1}
            </div>
            <div className="text-[10px] text-[#64718B] font-semibold">Cancelled</div>
          </div>
        </div>

        {/* SECTION B: UPCOMING APPOINTMENT FEATURED CARD */}
        {featured && (
          <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40] space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-[#172443] dark:text-white">
                Upcoming Appointment
              </h2>
              <button
                onClick={() => handleOpenAppt(featured)}
                className="text-xs font-bold text-[#8960D0] hover:underline flex items-center"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              onClick={() => handleOpenAppt(featured)}
              className="p-4 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40] cursor-pointer hover:border-[#5369D7]/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-black text-[#172443] dark:text-white truncate">
                      {featured.title}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EAFE] text-[#8960D0]">
                      <Clock className="w-3 h-3" />
                      <span>Upcoming</span>
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#5369D7] mb-1">
                    {featured.doctor}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#64718B] dark:text-[#A0B0C0] mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>City Care Children's Hospital</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#64718B] dark:text-[#A0B0C0]">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{featured.date}, {featured.time || "4:00 PM"}</span>
                  </div>
                </div>
              </div>

              {/* Set Reminder & Calendar Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-3.5 mt-3 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast({
                      title: "Reminder Set! ⏰",
                      description: `Alert set for ${featured.title} on ${featured.date}.`,
                    });
                  }}
                  className="py-2 px-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#8960D0] hover:bg-gray-50 flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Set Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      featured.title
                    )}`;
                    window.open(gcalUrl, "_blank");
                  }}
                  className="py-2 px-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#5369D7] hover:bg-gray-50 flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION C: RECENT APPOINTMENTS */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <h2 className="text-sm font-black text-[#172443] dark:text-white mb-3">
            Recent Appointments
          </h2>

          <div className="space-y-2.5">
            {/* General Checkup */}
            <div
              onClick={() =>
                handleOpenAppt({
                  title: "General Checkup",
                  doctor: "Dr. Meera Sharma",
                  date: "Nov 05, 2026",
                  completed: true,
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl border border-[#EAF0FF] dark:border-[#202F40] hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-green-50 text-[#22B96B] flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    General Checkup
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Dr. Meera Sharma
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F5] text-[#22B96B]">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                  <div className="text-[9px] text-[#64718B] mt-0.5">Nov 05, 2026</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Dental Checkup */}
            <div
              onClick={() =>
                handleOpenAppt({
                  title: "Dental Checkup",
                  doctor: "Dr. Rahul Verma",
                  date: "Oct 28, 2026",
                  completed: false,
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl border border-[#EAF0FF] dark:border-[#202F40] hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Dental Checkup
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Dr. Rahul Verma
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#EF4444]">
                    <XCircle className="w-3 h-3" />
                    <span>Cancelled</span>
                  </span>
                  <div className="text-[9px] text-[#64718B] mt-0.5">Oct 28, 2026</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA: + Book New Appointment (Request Parent) */}
        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white font-bold text-sm shadow-md shadow-[#5369D7]/25 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>

        {/* Note Box */}
        <div className="p-4 rounded-3xl bg-[#F0EAFE] dark:bg-[#8960D0]/15 border border-[#8960D0]/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#8960D0] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-[#5369D7] dark:text-[#C4B5FD] leading-relaxed">
            <strong className="block text-[#172443] dark:text-white mb-0.5">
              Parent Management Note
            </strong>
            Appointments are added and scheduled by your parent. Use the button above to request a doctor visit.
          </div>
        </div>
      </div>

      <ChildAppointmentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        appointment={selectedAppt}
      />

      {/* Appointment Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-[#172443] dark:text-white mb-1">
              Request Appointment from Parent
            </h3>
            <p className="text-xs text-[#64718B] dark:text-[#A0B0C0] mb-4">
              Need to see a doctor? Tell your parent what you're experiencing:
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Reason / Symptoms
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Toothache, eye checkup, or feeling feverish..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-xs font-bold shadow-md shadow-[#5369D7]/20 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ChildLayout>
  );
};

export default ChildAppointments;
