import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  HeartPulse,
  ClipboardCheck,
  Pill,
  Calendar,
  User,
  AlertTriangle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { FamCareLogo } from "../parent/FamCareLogo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ChildSidebarProps {
  onOpenSOS?: () => void;
}

export const ChildSidebar: React.FC<ChildSidebarProps> = ({ onOpenSOS }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, family, setSession, setUser } = useAuth();

  const navItems = [
    { label: "Home", path: "/child", icon: Home, desc: "Dashboard & Today's Summary" },
    { label: "Health", path: "/child/health", icon: HeartPulse, desc: "Vitals, Growth & Trends" },
    { label: "Check-in", path: "/child/check-in", icon: ClipboardCheck, desc: "Meals, Water, Sleep & Mood" },
    { label: "Medicines", path: "/child/medicines", icon: Pill, desc: "Prescriptions & Doses" },
    { label: "Appointments", path: "/child/appointments", icon: Calendar, desc: "Doctor Visits & Reminders" },
    { label: "Profile", path: "/child/profile", icon: User, desc: "Settings & Preferences" },
  ];

  const isActive = (path: string) => {
    if (path === "/child") return location.pathname === "/child";
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out of your Child account?")) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-white dark:bg-[#111A24] border-r border-[#EAF0FF] dark:border-[#1E2C3A] z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#EAF0FF] dark:border-[#1E2C3A]">
        <div className="cursor-pointer" onClick={() => navigate("/child")}>
          <FamCareLogo size="md" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#64718B] dark:text-[#7D8FA6]">
          Child Space
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-150 text-left group ${
                active
                  ? "bg-gradient-to-r from-[#5369D7]/10 to-[#8960D0]/10 text-[#5369D7] dark:text-[#A78BFA] font-bold shadow-sm"
                  : "text-[#64718B] dark:text-[#A0B0C0] hover:bg-[#F6F7FC] dark:hover:bg-[#182330] hover:text-[#172443]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    active
                      ? "bg-gradient-to-br from-[#5369D7] to-[#8960D0] text-white shadow-sm"
                      : "bg-[#F6F7FC] dark:bg-[#1B2836] text-[#64718B] group-hover:text-[#5369D7]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">{item.label}</div>
                  <div className="text-[10px] text-[#64718B] dark:text-[#7D8FA6] font-normal leading-tight">
                    {item.desc}
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  active ? "text-[#5369D7] translate-x-0.5" : "text-transparent group-hover:text-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Child Profile summary & Emergency SOS */}
      <div className="p-4 border-t border-[#EAF0FF] dark:border-[#1E2C3A] space-y-3">
        {/* Child Profile Card */}
        <div
          onClick={() => navigate("/child/profile")}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F6F7FC] dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] cursor-pointer hover:border-[#5369D7]/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5369D7] to-[#8960D0] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-[#172443] dark:text-white truncate">
              {profile?.full_name || "Child Account"}
            </div>
            <div className="text-[10px] text-[#64718B] dark:text-[#A0B0C0] truncate">
              {family?.name || "Connected Family"}
            </div>
          </div>
        </div>

        {/* SOS Button */}
        {onOpenSOS && (
          <button
            onClick={onOpenSOS}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#EF4444] hover:bg-red-600 active:scale-98 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-[#64718B] hover:text-[#EF4444] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default ChildSidebar;
