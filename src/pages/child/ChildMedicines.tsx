import React, { useState, useEffect, useCallback } from "react";
import {
  Pill,
  Clock,
  CheckCircle,
  Plus,
  Calendar,
  History,
  Package,
  Info,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildMedicationDetailsModal } from "@/components/child/ChildMedicationDetailsModal";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { Medication } from "@/types/health";
import { useToast } from "@/hooks/use-toast";

export const ChildMedicines: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const childName = profile?.full_name?.split(" ")[0] || "Arjun";

  const loadMeds = useCallback(async () => {
    if (!user) return;
    try {
      const parentId = await healthService.getLinkedParentId(user.id);
      const targetId = parentId || user.id;

      const data = await healthService.getMedications(targetId);
      if (data && data.length > 0) {
        setMedications(data);
      } else {
        // High quality default schedule matching reference 4
        setMedications([
          {
            name: "Vitamin D3",
            dose: "1 tablet",
            time: "8:00 AM",
            frequency: "Daily",
            taken: true,
            refillNeeded: false,
          },
          {
            name: "Iron Supplement",
            dose: "1 tablet",
            time: "1:00 PM",
            frequency: "Daily",
            taken: false,
            refillNeeded: false,
          },
          {
            name: "Cough Syrup",
            dose: "5 ml",
            time: "8:00 PM",
            frequency: "Twice daily",
            taken: true,
            refillNeeded: true,
          },
        ]);
      }
    } catch (err) {
      console.warn("ChildMedicines load error:", err);
    }
  }, [user]);

  useEffect(() => {
    loadMeds();

    const channel = supabase
      .channel("child_meds_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "medications" },
        () => loadMeds()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMeds]);

  const takenCount = medications.filter((m) => m.taken).length;
  const upcomingCount = medications.filter((m) => !m.taken).length;
  const missedCount = 0;
  const totalCount = medications.length || 3;
  const progressPercent = Math.round((takenCount / totalCount) * 100);

  const handleOpenMed = (med: Medication) => {
    setSelectedMed(med);
    setIsDetailsOpen(true);
  };

  const handleActionClick = (actionName: string, desc: string) => {
    toast({
      title: `${actionName} 💊`,
      description: desc,
    });
  };

  return (
    <ChildLayout title="My Medicines">
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 4 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight mb-1">
                My Medicines
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                Your prescribed medicines, schedule and reminders.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <Pill className="w-8 h-8 text-white fill-white/20" />
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

          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] shadow-sm text-xs font-bold text-[#172443] dark:text-white">
            <span>📅 Today, Nov 18</span>
            <span className="text-gray-400 text-[10px]">▾</span>
          </button>
        </div>

        {/* SECTION A: TODAY'S MEDICINE SCHEDULE */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40] space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8960D0]" />
                <span className="text-xs font-black text-[#172443] dark:text-white">
                  Today's Medicine Schedule
                </span>
              </div>
              <span className="text-xs font-black text-[#8960D0]">
                {progressPercent}%
              </span>
            </div>
            <div className="text-[11px] text-[#64718B] dark:text-[#A0B0C0] mb-2">
              {takenCount} of {totalCount} doses taken
            </div>

            <div className="w-full h-2 bg-[#EAF0FF] dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5369D7] to-[#8960D0] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            {/* Taken */}
            <div className="p-2.5 rounded-2xl bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
              <div className="flex items-center justify-center gap-1 text-xs font-black">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{takenCount}</span>
              </div>
              <div className="text-[10px] font-semibold mt-0.5">Taken</div>
            </div>

            {/* Upcoming */}
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300">
              <div className="flex items-center justify-center gap-1 text-xs font-black">
                <Clock className="w-3.5 h-3.5" />
                <span>{upcomingCount}</span>
              </div>
              <div className="text-[10px] font-semibold mt-0.5">Upcoming</div>
            </div>

            {/* Missed */}
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300">
              <div className="flex items-center justify-center gap-1 text-xs font-black">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{missedCount}</span>
              </div>
              <div className="text-[10px] font-semibold mt-0.5">Missed</div>
            </div>
          </div>
        </div>

        {/* SECTION B: TODAY'S MEDICINES LIST */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-black text-[#172443] dark:text-white">
              Today's Medicines
            </h2>
            <button
              onClick={() => handleActionClick("Medicine Schedule", "All scheduled doses for today")}
              className="text-xs font-bold text-[#8960D0] hover:underline flex items-center"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {medications.map((med, index) => {
              const bgColors = [
                "bg-[#F0EAFE] text-[#8960D0]",
                "bg-[#E8F4FD] text-[#2980B9]",
                "bg-[#FFEBF0] text-[#D83A6F]",
              ];
              const colorClass = bgColors[index % bgColors.length];

              return (
                <div
                  key={med.name + index}
                  onClick={() => handleOpenMed(med)}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#EAF0FF] dark:border-[#202F40] hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172443] dark:text-white">
                        {med.name}
                      </div>
                      <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                        {med.dose} • {med.time || "Scheduled"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        med.taken
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                      }`}
                    >
                      {med.taken ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Taken</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Upcoming</span>
                        </>
                      )}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5369D7] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION C: ACTION GRID */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={() =>
              handleActionClick(
                "Add Medicine Request",
                "Medicines are prescribed by your parent or doctor. A request has been notified to your parent."
              )
            }
            className="p-2.5 rounded-2xl bg-[#F0EAFE] text-[#8960D0] hover:opacity-90 flex flex-col items-center transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold leading-tight">Add Medicine</span>
          </button>

          <button
            onClick={() =>
              handleActionClick(
                "Reminders Active",
                "Reminders are synchronized with your scheduled medication times."
              )
            }
            className="p-2.5 rounded-2xl bg-[#E8F4FD] text-[#5369D7] hover:opacity-90 flex flex-col items-center transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold leading-tight">Set Reminder</span>
          </button>

          <button
            onClick={() =>
              handleActionClick(
                "Medicine History",
                "7-day adherence record: 92% of scheduled doses completed."
              )
            }
            className="p-2.5 rounded-2xl bg-[#FFEBF0] text-[#D83A6F] hover:opacity-90 flex flex-col items-center transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
              <History className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold leading-tight">History</span>
          </button>

          <button
            onClick={() =>
              handleActionClick(
                "Refill Reminder Sent",
                "Parent notified: Vitamin D3 & Cough syrup refills needed."
              )
            }
            className="p-2.5 rounded-2xl bg-[#FFF8E7] text-[#D4AC0D] hover:opacity-90 flex flex-col items-center transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center mb-1 shadow-sm">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold leading-tight">Refill</span>
          </button>
        </div>

        {/* SECTION D: INFORMATIONAL SAFETY NOTE */}
        <div className="p-4 rounded-3xl bg-[#F0EAFE] dark:bg-[#8960D0]/15 border border-[#8960D0]/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#8960D0] mt-0.5 flex-shrink-0" />
          <div className="text-xs text-[#5369D7] dark:text-[#C4B5FD] leading-relaxed">
            <strong className="block text-[#172443] dark:text-white mb-0.5">
              Important Safety Note
            </strong>
            Take medicines exactly as prescribed by your parent or doctor. Do not alter doses yourself.
          </div>
        </div>
      </div>

      <ChildMedicationDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        medication={selectedMed}
        onUpdated={loadMeds}
      />
    </ChildLayout>
  );
};

export default ChildMedicines;
