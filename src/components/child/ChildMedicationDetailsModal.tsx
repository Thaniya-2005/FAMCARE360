import React, { useState } from "react";
import { X, Pill, Clock, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { Medication } from "@/types/health";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChildMedicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication | null;
  onUpdated?: () => void;
}

export const ChildMedicationDetailsModal: React.FC<ChildMedicationDetailsModalProps> = ({
  isOpen,
  onClose,
  medication,
  onUpdated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !medication) return null;

  const handleToggleTaken = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const newStatus = !medication.taken;
      const { error } = await supabase
        .from("medications")
        .update({ taken: newStatus })
        .eq("name", medication.name);

      if (error) {
        console.warn("Could not update remote medication status:", error.message);
      }

      toast({
        title: newStatus ? "Dose Marked as Taken! 💊" : "Dose Marked as Pending",
        description: `${medication.name} (${medication.dose}) updated.`,
      });

      onUpdated?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating medicine";
      toast({ title: "Update Failed", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172443] dark:text-white">
                {medication.name}
              </h3>
              <p className="text-xs text-[#64718B] dark:text-[#A0B0C0]">
                {medication.dose} • {medication.frequency || "Daily"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5">
          {/* Status Chip */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5369D7]" />
              <span className="text-xs font-semibold text-[#172443] dark:text-white">
                Scheduled Time:
              </span>
            </div>
            <span className="text-xs font-bold text-[#5369D7]">
              {medication.time || "Scheduled today"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#172443] dark:text-white">
                Today's Status:
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                medication.taken
                  ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {medication.taken ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Taken</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Upcoming</span>
                </>
              )}
            </span>
          </div>

          {/* Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-[#F0EAFE] dark:bg-[#8960D0]/15 border border-[#8960D0]/20 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#8960D0] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#5369D7] dark:text-[#C4B5FD] leading-relaxed">
              <strong>Safety Note:</strong> Prescriptions are managed by your parent. Never take medicines without adult supervision.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[#EAF0FF] dark:border-[#202F40]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleToggleTaken}
            disabled={isSubmitting}
            className={`flex-1 py-2.5 px-3 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 ${
              medication.taken
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gradient-to-r from-[#22B96B] to-[#1ABC9C] hover:opacity-95"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : medication.taken ? (
              <span>Mark as Not Taken</span>
            ) : (
              <span>✔ Mark as Taken</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildMedicationDetailsModal;
