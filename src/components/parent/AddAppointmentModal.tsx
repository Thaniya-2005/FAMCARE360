import React, { useState } from "react";
import { X, Calendar, Clock, UserCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentAdded: () => void;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAppointmentAdded,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({
        title: "Validation Error",
        description: "Title and Date are required.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      await healthService.addAppointment(user.id, {
        title: title.trim(),
        doctor: doctor.trim() || "Family Physician",
        date,
        time: time || "10:00 AM",
        notes: notes.trim(),
        completed: false,
      });

      // Dispatch reminder notification to linked children
      const childrenList = await healthService.getChildren(user.id);
      for (const child of childrenList) {
        if (child.linked_user_id) {
          await healthService.notifyChildOfAppointment(
            child.linked_user_id,
            title.trim(),
            doctor.trim() || "Family Physician",
            date,
            time || "10:00 AM"
          );
        }
      }

      toast({
        title: "Appointment Scheduled! 📅",
        description: `Appointment for ${title} has been booked.`,
      });

      setTitle("");
      setDoctor("");
      setDate("");
      setTime("");
      setNotes("");
      onAppointmentAdded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to book appointment";
      toast({
        title: "Scheduling Error",
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
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Add Appointment
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Schedule upcoming medical visits and checkups.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Appointment Title *
            </Label>
            <Input
              placeholder="e.g. Pediatric Checkup, Dental Cleaning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border-[#E2EEF1]"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Doctor or Clinic Name
            </Label>
            <Input
              placeholder="e.g. Dr. Sarah Jenkins / City Children's Clinic"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="rounded-xl border-[#E2EEF1]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
                Date *
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl border-[#E2EEF1]"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
                Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl border-[#E2EEF1]"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Notes / Instructions (Optional)
            </Label>
            <Textarea
              placeholder="e.g. Fasting required, bring immunization record..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl border-[#E2EEF1] text-sm"
            />
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
                <span>Confirm Booking</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAppointmentModal;
