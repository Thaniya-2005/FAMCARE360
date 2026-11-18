import React, { useState } from "react";
import { X, Pill, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicationAdded: () => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  onMedicationAdded,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("Daily");
  const [time, setTime] = useState("08:00 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Medication name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      await healthService.addMedication(user.id, {
        name: name.trim(),
        dose: dose.trim() || "1 tablet",
        frequency,
        time,
        taken: false,
        refillNeeded: false,
      });

      // Dispatch reminder notification to linked children
      const childrenList = await healthService.getChildren(user.id);
      for (const child of childrenList) {
        if (child.linked_user_id) {
          await healthService.notifyChildOfMedication(
            child.linked_user_id,
            name.trim(),
            dose.trim() || "1 tablet",
            time
          );
        }
      }

      toast({
        title: "Medication Scheduled! 💊",
        description: `${name} has been added to family medications.`,
      });

      setName("");
      setDose("");
      onMedicationAdded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add medication";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#60738F] hover:text-[#102443] dark:hover:text-white p-1.5 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#F3E8FF] dark:bg-purple-950/40 text-[#9333EA] flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Add Medication
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Track prescriptions, dosage times, and refill reminders.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Medication Name *
            </Label>
            <Input
              placeholder="e.g. Amoxicillin, Daily Multivitamin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-[#E2EEF1]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
                Dosage
              </Label>
              <Input
                placeholder="e.g. 250mg, 1 tablet"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="rounded-xl border-[#E2EEF1]"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
                Scheduled Time
              </Label>
              <Input
                placeholder="e.g. 08:00 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl border-[#E2EEF1]"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Frequency
            </Label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-[#E2EEF1] dark:border-[#1E2C3A] bg-white dark:bg-[#182330] text-sm font-semibold text-[#102443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#159FA6]"
            >
              <option value="Daily">Once Daily</option>
              <option value="Twice daily">Twice Daily</option>
              <option value="Three times daily">Three Times Daily</option>
              <option value="As needed">As Needed (PRN)</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#159FA6] to-[#087B88] text-white shadow-md shadow-[#159FA6]/20 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Add Medication</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicationModal;
