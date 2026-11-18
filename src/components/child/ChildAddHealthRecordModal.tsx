import React, { useState } from "react";
import { X, Heart, Thermometer, Footprints, Ruler, Weight, Loader2 } from "lucide-react";
import { healthService } from "@/services/healthService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChildAddHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChildAddHealthRecordModal: React.FC<ChildAddHealthRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [heartRate, setHeartRate] = useState("78");
  const [temperature, setTemperature] = useState("98.4");
  const [stepsCount, setStepsCount] = useState("4500");
  const [heightCm, setHeightCm] = useState("142");
  const [weightKg, setWeightKg] = useState("36");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const existing = await healthService.getTodayHealthReport(user.id);

      const hr = parseInt(heartRate) || 76;
      const temp = parseFloat(temperature) || 98.4;
      const steps = parseInt(stepsCount) || 0;
      const distance = parseFloat((steps * 0.0007).toFixed(2));
      const calories = Math.round(steps * 0.04);

      const res = await healthService.saveHealthReport(user.id, {
        date: today,
        heartRate: hr,
        temperature: temp,
        stepsCount: steps,
        distanceKm: distance,
        activeCalories: calories,
        waterIntake: existing?.waterIntake ?? 6,
        moodScore: existing?.moodScore ?? 4,
        sleepHours: existing?.sleepHours ?? 7.5,
        lifestyleScore: Math.min(100, Math.round(75 + (steps > 5000 ? 10 : 5))),
      });

      if (res.success) {
        toast({
          title: "Health Record Added! 📈",
          description: "Your vitals and activity were saved successfully.",
        });
        onSuccess?.();
        onClose();
      } else {
        throw new Error(res.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record vitals";
      toast({
        title: "Record Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172443] dark:text-white">
                Add Health Record
              </h3>
              <p className="text-[11px] text-[#64718B] dark:text-[#A0B0C0]">
                Record today's measurements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#172443] dark:text-white mb-1">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>Heart Rate (bpm)</span>
              </label>
              <input
                type="number"
                required
                min="40"
                max="200"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#172443] dark:text-white mb-1">
                <Thermometer className="w-3.5 h-3.5 text-red-500" />
                <span>Temp (°F)</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-[#172443] dark:text-white mb-1">
              <Footprints className="w-3.5 h-3.5 text-amber-500" />
              <span>Steps Count Today</span>
            </label>
            <input
              type="number"
              value={stepsCount}
              onChange={(e) => setStepsCount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#172443] dark:text-white mb-1">
                <Ruler className="w-3.5 h-3.5 text-sky-500" />
                <span>Height (cm)</span>
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#172443] dark:text-white mb-1">
                <Weight className="w-3.5 h-3.5 text-purple-500" />
                <span>Weight (kg)</span>
              </label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#EAF0FF] dark:border-[#202F40]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-xs font-bold shadow-md shadow-[#5369D7]/20 flex items-center justify-center gap-2 hover:opacity-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildAddHealthRecordModal;
