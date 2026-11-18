import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit2,
  Calendar,
  Users,
  Lock,
  Heart,
  Bell,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Camera,
  Moon,
  Sun,
  Shield,
  Loader2,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { ChildEditProfileModal } from "@/components/child/ChildEditProfileModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ChildProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, family, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  const childName = profile?.full_name || "Arjun Kumar";
  const familyName = family?.name || "Connected Family";

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("famcare360_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("famcare360_theme", "light");
    }
    toast({
      title: nextDark ? "Dark Mode Enabled 🌙" : "Light Mode Enabled ☀️",
      description: "App appearance preference updated.",
    });
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of FAMCARE360?")) {
      await signOut();
      navigate("/login");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({
        title: "Password Updated! 🔒",
        description: "Your child account password was changed successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password update failed";
      toast({ title: "Update Failed", description: msg, variant: "destructive" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ChildLayout title="My Profile">
      <div className="space-y-4 max-w-lg mx-auto">
        {/* HERO BANNER matching Reference 6 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] p-5 text-white shadow-lg shadow-[#5369D7]/20">
          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h1 className="text-2xl font-black tracking-tight mb-1">
                My Profile
              </h1>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                Your personal details, settings and account preferences.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center p-2.5 flex-shrink-0 shadow-inner">
              <User className="w-8 h-8 text-white fill-white/20" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* SECTION A: PROFILE CARD */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <div className="flex items-start gap-4">
            {/* Avatar with Camera Badge */}
            <div className="relative">
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#5369D7] to-[#8960D0] flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white dark:border-gray-800">
                {childName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#8960D0] text-white flex items-center justify-center shadow-sm border border-white"
                title="Change Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-black text-[#172443] dark:text-white truncate">
                  {childName}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-[#8960D0] hover:underline"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0EAFE] text-[#8960D0] mb-2">
                <span>👶</span>
                <span>Child Account</span>
              </span>

              <div className="space-y-1 text-xs text-[#64718B] dark:text-[#A0B0C0]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>13 years (Born: May 14, 2013)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>♂</span>
                  <span>Male</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">Family: {familyName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: ACCOUNT GROUP */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#64718B] dark:text-[#7D8FA6] mb-3">
            Account
          </h3>

          <div className="space-y-1">
            {/* Personal Information */}
            <div
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Personal Information
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    View and update your details
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Change Password */}
            <div
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F4FD] text-[#5369D7] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Change Password
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Update your account password
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* SECTION C: HEALTH & PREFERENCES */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#64718B] dark:text-[#7D8FA6] mb-3">
            Health & Preferences
          </h3>

          <div className="space-y-1">
            {/* Health Preferences */}
            <div
              onClick={() =>
                toast({
                  title: "Health Preferences ⚙️",
                  description: "Units: Metric (kg, cm, °F). Daily Goals: 8h Sleep, 6 Glasses Water.",
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#FFEBF0] text-[#D83A6F] flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Health Preferences
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Units, goals and health tracking settings
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Notification Settings */}
            <div
              onClick={() => navigate("/child/notifications")}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#F0EAFE] text-[#8960D0] flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Notification Settings
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Manage reminders and alerts
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* App Appearance */}
            <div
              onClick={toggleTheme}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#E8F8F5] text-[#1ABC9C] flex items-center justify-center">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    App Appearance
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Light / Dark mode
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                  {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: SUPPORT & INFORMATION */}
        <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-5 shadow-sm border border-[#EAF0FF] dark:border-[#202F40]">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#64718B] dark:text-[#7D8FA6] mb-3">
            Support & Information
          </h3>

          <div className="space-y-1">
            <div
              onClick={() =>
                toast({
                  title: "Help & Support 🩺",
                  description: "Need help? Ask your parent or contact support at support@famcare360.com",
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    Help & Support
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    Get help or contact our support team
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            <div
              onClick={() =>
                toast({
                  title: "About FAMCARE360 v2.4 💚",
                  description: "Family Health Connect. Safe, connected healthcare for every family.",
                })
              }
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F6F7FC] dark:hover:bg-[#1A2533] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8960D0] flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#172443] dark:text-white">
                    About FAMCARE360
                  </div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0]">
                    App version, terms and privacy
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON matching Reference 6 */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-50 dark:bg-red-950/20 text-[#EF4444] border border-red-200 dark:border-red-900/40 text-xs font-black shadow-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      <ChildEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={refreshProfile}
      />

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161F2C] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#EAF0FF] dark:border-[#202F40] relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-[#172443] dark:text-white mb-1">
              Change Account Password
            </h3>
            <p className="text-xs text-[#64718B] dark:text-[#A0B0C0] mb-4">
              Enter a new secure password for your child account:
            </p>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#172443] dark:text-white block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#F6F7FC] dark:bg-[#1A2533] text-sm text-[#172443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5369D7]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={isChangingPassword}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white text-xs font-bold shadow-md shadow-[#5369D7]/20 flex items-center justify-center gap-1.5"
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ChildLayout>
  );
};

export default ChildProfile;
