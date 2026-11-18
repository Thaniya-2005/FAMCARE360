import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Heart, Layers, LayoutGrid, AlertTriangle, Bell, User } from "lucide-react";
import { FamCareLogo } from "./FamCareLogo";
import { useAuth } from "@/contexts/AuthContext";

interface ParentSidebarProps {
  onOpenSOS: () => void;
}

export const ParentSidebar: React.FC<ParentSidebarProps> = ({ onOpenSOS }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();

  const navItems = [
    { label: "Home", path: "/parent", icon: Home },
    { label: "Family", path: "/parent/family", icon: Users },
    { label: "Health", path: "/parent/health", icon: Heart },
    { label: "Care", path: "/parent/care", icon: Layers },
    { label: "More", path: "/parent/more", icon: LayoutGrid },
  ];

  const isActive = (path: string) => {
    if (path === "/parent") return location.pathname === "/parent";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-[#111A24] border-r border-[#E2EEF1] dark:border-[#1E2C3A] p-5 select-none fixed left-0 top-0 bottom-0 z-30">
      {/* Brand Logo */}
      <div
        className="cursor-pointer mb-8 pt-2"
        onClick={() => navigate("/parent")}
        title="FamCare360 Home"
      >
        <FamCareLogo size="md" />
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#90A4AE] dark:text-[#60738F] px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                active
                  ? "bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] dark:text-[#42C5C9] shadow-sm shadow-[#159FA6]/10"
                  : "text-[#60738F] dark:text-[#A0B0C0] hover:bg-[#F4FAFC] dark:hover:bg-[#182330] hover:text-[#102443] dark:hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#159FA6] dark:text-[#42C5C9]" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#90A4AE] dark:text-[#60738F] px-3 mb-2">
            Alerts
          </div>
          <button
            onClick={() => navigate("/parent/notifications")}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
              isActive("/parent/notifications")
                ? "bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] dark:text-[#42C5C9]"
                : "text-[#60738F] dark:text-[#A0B0C0] hover:bg-[#F4FAFC] dark:hover:bg-[#182330] hover:text-[#102443] dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          </button>
        </div>
      </nav>

      {/* Emergency SOS Persistent Button */}
      <div className="pt-4 pb-4 border-t border-[#E2EEF1] dark:border-[#1E2C3A]">
        <button
          onClick={onOpenSOS}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#F87171] hover:from-[#DC2626] hover:to-[#EF4444] text-white font-bold text-sm shadow-md shadow-[#EF4444]/25 transition-all duration-200 active:scale-[0.98]"
        >
          <AlertTriangle className="w-4 h-4 fill-white text-[#EF4444]" />
          <span>Emergency SOS</span>
        </button>
      </div>

      {/* User Profile Card */}
      <div
        onClick={() => navigate("/parent/more")}
        className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] hover:bg-[#EBF5F8] dark:hover:bg-[#1E2B3A] cursor-pointer transition-colors border border-[#E2EEF1] dark:border-[#223344]"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#159FA6] to-[#42C5C9] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#102443] dark:text-white truncate">
            {profile?.full_name || "Parent Account"}
          </div>
          <div className="text-xs text-[#60738F] dark:text-[#8FA0B5] truncate">
            {user?.email || "Primary Caregiver"}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ParentSidebar;
