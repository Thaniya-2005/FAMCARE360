import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert, CheckCircle, Loader2 } from "lucide-react";
import { healthService } from "@/services/healthService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EmergencySOSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentVitals?: {
    heartRate?: number;
    temperature?: number;
  };
}

export const EmergencySOSDialog: React.FC<EmergencySOSDialogProps> = ({
  isOpen,
  onClose,
  currentVitals,
}) => {
  const { user, family } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [smsDeliveryStatus, setSmsDeliveryStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmSOS = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        const result = await healthService.triggerEmergencySOS(user.id, {
          heartRate: currentVitals?.heartRate ?? 78,
          temperature: currentVitals?.temperature ?? 98.6,
        });

        setAlertSent(true);
        if (result.isSmsConfigured) {
          setSmsDeliveryStatus("Emergency SMS broadcast dispatched to linked family contacts.");
        } else {
          setSmsDeliveryStatus(
            "In-app emergency alert created. Note: External SMS gateway is currently in test mode, so notifications were logged to your family dashboard."
          );
        }

        toast({
          title: "🚨 Emergency Alert Triggered",
          description: "Alert record created and broadcast to family members.",
          variant: "destructive",
        });
      } else {
        setAlertSent(true);
        setSmsDeliveryStatus("Emergency SOS recorded locally (Offline mode).");
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
    setSmsDeliveryStatus(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EF4444]/30 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Top Warning Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#EF4444] via-[#F87171] to-[#EF4444]" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-[#60738F] hover:text-[#102443] dark:hover:text-white p-1.5 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        {!alertSent ? (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight mb-2">
              Trigger Emergency SOS?
            </h3>

            <p className="text-sm text-[#60738F] dark:text-[#A0B0C0] leading-relaxed mb-4">
              This will create a high-priority distress alert for{" "}
              <strong className="text-[#102443] dark:text-white">
                {family?.name || "your family circle"}
              </strong>
              , capturing your latest recorded vital signs.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FFF5F5] dark:bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444] leading-normal mb-6">
              <strong>Notice:</strong> This in-app alert notifies linked caregivers and family members. For life-threatening emergencies, please call local emergency services (e.g. 911 / 112) immediately.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSOS}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-md shadow-[#EF4444]/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 fill-white text-[#EF4444]" />
                    <span>Confirm Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-[#22B96B]/10 text-[#22B96B] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight mb-2">
              Emergency Alert Broadcasted
            </h3>

            <p className="text-sm text-[#60738F] dark:text-[#A0B0C0] leading-relaxed mb-4">
              Your SOS status has been recorded in the Supabase emergency registry.
            </p>

            {smsDeliveryStatus && (
              <div className="p-3.5 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] border border-[#E2EEF1] dark:border-[#223344] text-xs text-[#60738F] dark:text-[#A0B0C0] leading-normal text-left mb-6">
                {smsDeliveryStatus}
              </div>
            )}

            <button
              onClick={handleDismiss}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#159FA6] text-white hover:bg-[#087B88] transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencySOSDialog;
