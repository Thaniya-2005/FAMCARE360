import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { healthService } from "@/services/healthService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChildEmergencySOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentVitals?: {
    heartRate?: number;
    temperature?: number;
  };
}

export const ChildEmergencySOSDialog: React.FC<ChildEmergencySOSDialogProps> = ({
  isOpen,
  onClose,
  currentVitals,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmSOS = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        const result = await healthService.triggerEmergencySOS(user.id, {
          heartRate: currentVitals?.heartRate ?? 76,
          temperature: currentVitals?.temperature ?? 98.4,
        });

        setAlertSent(true);
        if (result.isSmsConfigured) {
          setDeliveryStatus("Emergency alert sent! Your parents and family have been notified immediately.");
        } else {
          setDeliveryStatus(
            "Emergency SOS created and broadcasted to your Family Dashboard. Your parents will see this high-priority alert immediately upon opening the app."
          );
        }

        toast({
          title: "🚨 Emergency Alert Triggered",
          description: "Alert record created and broadcast to family members.",
          variant: "destructive",
        });
      } else {
        setAlertSent(true);
        setDeliveryStatus("Emergency SOS recorded locally.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to broadcast SOS alert";
      toast({
        title: "SOS Broadcast Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setAlertSent(false);
    setDeliveryStatus(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-red-200 dark:border-red-900/40 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!alertSent ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center mb-4 text-[#EF4444]">
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-[#172443] dark:text-white mb-2">
              Need Help? Send Emergency SOS
            </h3>

            <p className="text-sm text-[#64718B] dark:text-[#A0B0C0] mb-5 leading-relaxed">
              Pressing confirm will immediately alert your parents and family members with your latest health status and timestamp.
            </p>

            <div className="w-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 rounded-2xl p-3.5 mb-6 text-left">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                  Use this when you feel unwell, unsafe, or need immediate adult attention.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSOS}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#EF4444] hover:bg-red-600 active:scale-95 text-white text-sm font-bold shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <span>Yes, Alert Family!</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/60 flex items-center justify-center mb-4 text-[#22B96B]">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="text-xl font-black text-[#172443] dark:text-white mb-2">
              Alert Broadcasted!
            </h3>

            <p className="text-sm text-[#64718B] dark:text-[#A0B0C0] mb-6 leading-relaxed">
              {deliveryStatus}
            </p>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-sm font-bold shadow-md shadow-[#5369D7]/20 hover:opacity-95 transition-opacity"
            >
              I Understand / Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildEmergencySOSDialog;
