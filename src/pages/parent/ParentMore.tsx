import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Edit3, Users, Share2, Bell, Shield, Settings,
  HelpCircle, Info, LogOut, ChevronRight, Crown, Moon, Sun, X, Check
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { EditProfileModal } from "@/components/parent/EditProfileModal";
import { InviteFamilyModal } from "@/components/parent/InviteFamilyModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ParentMore: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast({
      title: nextDark ? "Dark Mode Enabled 🌙" : "Light Mode Enabled ☀️",
      description: "Visual appearance updated.",
    });
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have securely logged out of FamCare360.",
      });
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <ParentLayout title="More">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* =========================================================================
            1. HERO BANNER matching Reference 5
        ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#159FA6] via-[#1FAFB6] to-[#42C5C9] p-6 sm:p-7 text-white shadow-lg shadow-[#159FA6]/20">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              More
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Manage your account, preferences, support and app settings.
            </p>
          </div>

          <div className="absolute right-4 -bottom-4 opacity-25 sm:opacity-35 pointer-events-none">
            <svg width="170" height="150" viewBox="0 0 180 150" fill="none">
              <circle cx="100" cy="75" r="45" stroke="white" strokeWidth="12" strokeDasharray="16 10" />
              <circle cx="100" cy="75" r="20" fill="white" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            2. PARENT ACCOUNT CARD matching Reference 5
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#159FA6] to-[#42C5C9] text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-[#E6F8F7] dark:ring-teal-950/40">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-[#102443] dark:text-white">
                  Parent Account
                </span>
                <Crown className="w-4 h-4 fill-[#F3A623] text-[#F3A623]" />
              </div>
              <div className="text-xs font-semibold text-[#159FA6] dark:text-[#42C5C9]">
                {profile?.full_name || "Primary Caregiver"}
              </div>
              <div className="text-xs text-[#60738F] dark:text-[#A0B0C0] mt-0.5">
                {user?.email || "autohireai@gmail.com"}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] dark:text-[#42C5C9] text-xs font-bold hover:bg-[#D7F3F1] transition-colors self-end sm:self-center"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* =========================================================================
            3. SECTION B: Family & Access matching Reference 5
        ========================================================================== */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#90A4AE] dark:text-[#60738F] px-1">
            Family & Access
          </h4>

          <div className="bg-white dark:bg-[#111A24] rounded-3xl border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card overflow-hidden divide-y divide-[#E2EEF1] dark:divide-[#1E2C3A]">
            <div
              onClick={() => navigate("/parent/family")}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-teal-950/30 text-[#159FA6] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    Manage Family
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Add members, view profiles and access
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>

            <div
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/30 text-[#9333EA] flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    Invite to Family
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Share your family code
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. SECTION C: App Preferences matching Reference 5
        ========================================================================== */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#90A4AE] dark:text-[#60738F] px-1">
            App Preferences
          </h4>

          <div className="bg-white dark:bg-[#111A24] rounded-3xl border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card overflow-hidden divide-y divide-[#E2EEF1] dark:divide-[#1E2C3A]">
            <div
              onClick={() => navigate("/parent/notifications")}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/30 text-[#EF4444] flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    Notification Settings
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Health alerts, reminders and SOS
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>

            <div
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-teal-950/30 text-[#159FA6] flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    Privacy & Consent
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Manage data, permissions and sharing
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>

            <div
              onClick={toggleTheme}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/30 text-[#2563EB] flex items-center justify-center">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    App Appearance (Theme)
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Currently in {isDark ? "Dark Mode 🌙" : "Light Mode ☀️"} (Click to switch)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#159FA6]">
                  {isDark ? "Dark" : "Light"}
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F]" />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            5. SECTION D: Support & Information matching Reference 5
        ========================================================================== */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#90A4AE] dark:text-[#60738F] px-1">
            Support & Information
          </h4>

          <div className="bg-white dark:bg-[#111A24] rounded-3xl border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card overflow-hidden divide-y divide-[#E2EEF1] dark:divide-[#1E2C3A]">
            <div
              onClick={() => setShowSupportModal(true)}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/30 text-[#9333EA] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    Help & Support
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    FAQs, guides and contact us
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>

            <div
              onClick={() => setShowAboutModal(true)}
              className="flex items-center justify-between p-4 hover:bg-[#F4FAFC] dark:hover:bg-[#182330] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] dark:bg-amber-950/30 text-[#D97706] flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#102443] dark:text-white">
                    About FAMCARE360
                  </div>
                  <div className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Version 2.4.0, terms and policies
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#60738F]" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            6. SECTION E: Logout Button matching Reference 5
        ========================================================================== */}
        <div className="pt-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-4 px-6 rounded-2xl bg-[#FFF1F2] dark:bg-rose-950/20 hover:bg-[#FFE4E6] text-[#EF4444] font-bold text-base border border-[#FFE4E6] dark:border-rose-900/30 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
          >
            <LogOut className="w-5 h-5 text-[#EF4444]" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-sm w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] text-center max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] text-[#EF4444] flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-[#102443] dark:text-white tracking-tight mb-1">
              Sign Out?
            </h4>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] mb-5">
              Are you sure you want to sign out of your FamCare360 session?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-muted text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-[#EF4444] text-white hover:bg-[#DC2626]"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Dialog */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-[#60738F] p-1.5 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-[#102443] dark:text-white mb-2">
              Privacy & Family Consent
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] leading-relaxed mb-4">
              FamCare360 strictly enforces family-level data isolation using PostgreSQL Row Level Security (RLS). Health records, vitals, and appointments can only be viewed by authorized family members. No personal medical information is shared or sold.
            </p>
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#159FA6] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Support FAQ Dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 text-[#60738F] p-1.5 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-[#102443] dark:text-white mb-2">
              Help & Support
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] leading-relaxed mb-3">
              Need assistance? Email our dedicated healthcare support team at <strong>support@famcare360.app</strong> or review our getting started guide in the documentation.
            </p>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#159FA6] text-white font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* About FamCare360 Dialog */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative text-center max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-[#60738F] p-1.5 rounded-full hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-[#102443] dark:text-white mb-1">
              FAMCARE360
            </h3>
            <span className="text-xs font-semibold text-[#159FA6] block mb-3">
              Family Health Connect • v2.4.0
            </span>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] leading-relaxed mb-4">
              Comprehensive connected family health ecosystem designed for proactive caregiver tracking, emergency response, and daily wellness management.
            </p>
            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#159FA6] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={refreshProfile}
      />

      {/* Invite Family Modal */}
      <InviteFamilyModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </ParentLayout>
  );
};

export default ParentMore;
