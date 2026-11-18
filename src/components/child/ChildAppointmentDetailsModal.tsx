import React, { useState } from "react";
import { X, Calendar, Clock, MapPin, User, Bell, CheckCircle, ExternalLink } from "lucide-react";
import { Appointment } from "@/types/health";
import { useToast } from "@/hooks/use-toast";

interface ChildAppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const ChildAppointmentDetailsModal: React.FC<ChildAppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { toast } = useToast();
  const [reminderSet, setReminderSet] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSetReminder = () => {
    setReminderSet(true);
    toast({
      title: "Reminder Activated! ⏰",
      description: `We'll remind you on the morning of ${appointment.date} for ${appointment.title}.`,
    });
  };

  const handleAddToCalendar = () => {
    // Generate Google Calendar Link
    const title = encodeURIComponent(appointment.title);
    const details = encodeURIComponent(
      `Doctor: ${appointment.doctor}\nNotes: ${appointment.notes || "Routine health visit"}`
    );
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, "_blank");

    toast({
      title: "Opening Calendar 📅",
      description: "Added to your calendar schedule.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F4FD] text-[#5369D7] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172443] dark:text-white">
                {appointment.title}
              </h3>
              <p className="text-xs text-[#64718B] dark:text-[#A0B0C0]">
                {appointment.doctor}
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

        <div className="py-4 space-y-3">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40]">
            <Clock className="w-4 h-4 text-[#5369D7] flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#172443] dark:text-white">
                Date & Time:
              </span>{" "}
              <span className="text-[#64718B] dark:text-[#A0B0C0]">
                {appointment.date} • {appointment.time || "Scheduled Time"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40]">
            <MapPin className="w-4 h-4 text-[#8960D0] flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#172443] dark:text-white">
                Clinic Location:
              </span>{" "}
              <span className="text-[#64718B] dark:text-[#A0B0C0]">
                City Care Children's Health Center
              </span>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] border border-[#EAF0FF] dark:border-[#202F40] text-xs">
              <span className="font-bold text-[#172443] dark:text-white block mb-0.5">
                Parent Notes:
              </span>
              <p className="text-[#64718B] dark:text-[#A0B0C0] leading-relaxed">
                {appointment.notes}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSetReminder}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                reminderSet
                  ? "bg-purple-100 border-purple-300 text-[#8960D0]"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{reminderSet ? "Reminder Set ✔" : "Set Reminder"}</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCalendar}
              className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Add to Calendar</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#EAF0FF] dark:border-[#202F40]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-xs font-bold shadow-md shadow-[#5369D7]/20 hover:opacity-95"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildAppointmentDetailsModal;
