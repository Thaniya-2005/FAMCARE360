import React, { useState } from "react";
import { X, Copy, Check, Share2, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { family } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteCode = family?.invite_code || "FC-DEMO7A";
  const shareMessage = `Join my family health circle on FamCare360! Use family invitation code: ${inviteCode} at https://famcare360.app/login?role=child`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast({
        title: "Code Copied! 📋",
        description: `Family code ${inviteCode} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({
        title: "Copy failed",
        description: "Please manually select and copy the code.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join FamCare360 Family Circle",
          text: shareMessage,
        });
      } catch {
        // Share cancelled or failed
      }
    } else {
      await navigator.clipboard.writeText(shareMessage);
      toast({
        title: "Invitation Message Copied! 📤",
        description: "Paste and send this message to your family member.",
      });
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

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#159FA6]/20 to-[#42C5C9]/20 text-[#159FA6] flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
            Invite to Family
          </h3>
          <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] max-w-xs mx-auto mt-1">
            Share this unique code with caregivers or children so they can link their accounts to your circle.
          </p>
        </div>

        {/* Family Code Display Card matching Reference 2 */}
        <div className="bg-[#F4FAFC] dark:bg-[#182330] rounded-2xl p-4 border border-[#E2EEF1] dark:border-[#1E2C3A] mb-5 text-center">
          <div className="text-xs font-semibold text-[#60738F] dark:text-[#A0B0C0] uppercase tracking-wider mb-2">
            Your Family Invitation Code
          </div>
          <div className="text-2xl font-black tracking-widest text-[#159FA6] dark:text-[#42C5C9] font-mono py-1">
            {inviteCode}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#159FA6] to-[#087B88] text-white shadow-md shadow-[#159FA6]/20 hover:opacity-95 transition-opacity"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#22B96B]" />
                <span>Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Family Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-[#102443] dark:text-white hover:bg-muted/80 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Invitation Message</span>
          </button>
        </div>

        <div className="mt-5 text-[11px] text-[#60738F] dark:text-[#8FA0B5] text-center leading-relaxed">
          The recipient simply registers as a <strong>Child / Caregiver</strong> on FamCare360 and enters this code during signup.
        </div>
      </div>
    </div>
  );
};

export default InviteFamilyModal;
