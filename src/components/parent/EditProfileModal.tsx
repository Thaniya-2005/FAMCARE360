import React, { useState } from "react";
import { X, User, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
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
    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

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
        title: "Profile Updated! 👤",
        description: "Your parent profile information has been saved.",
      });

      onProfileUpdated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      toast({
        title: "Update Error",
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
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Edit Parent Profile
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Update your account display name and contact details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Full Name *
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="rounded-xl border-[#E2EEF1]"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Email Address
            </Label>
            <Input
              value={user?.email || ""}
              disabled
              className="rounded-xl border-[#E2EEF1] bg-muted cursor-not-allowed text-[#60738F]"
            />
            <p className="text-[11px] text-[#60738F] mt-1">
              Email is managed through authentication security.
            </p>
          </div>

          <div>
            <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1.5 block">
              Phone Number
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
              className="rounded-xl border-[#E2EEF1]"
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
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
