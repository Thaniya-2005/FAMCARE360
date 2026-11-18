import React, { useState } from "react";
import { X, User, Phone, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChildEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChildEditProfileModal: React.FC<ChildEditProfileModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Profile Updated! ✨",
        description: "Your name and contact details were saved.",
      });

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast({
        title: "Update Failed",
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
            <div className="w-10 h-10 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#172443] dark:text-white">
                Edit Child Profile
              </h3>
              <p className="text-xs text-[#64718B] dark:text-[#A0B0C0]">
                Update your display name & contact
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
              Emergency Contact Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
            />
          </div>

          <div className="p-3 rounded-2xl bg-[#F6F7FC] dark:bg-[#1A2533] text-[11px] text-[#64718B] dark:text-[#A0B0C0]">
            Note: Your account role (`child`) and family assignment are protected and managed by your parent.
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
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChildEditProfileModal;
