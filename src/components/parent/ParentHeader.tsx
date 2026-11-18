import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, AlertTriangle } from "lucide-react";
import { FamCareLogo } from "./FamCareLogo";
import { useAuth } from "@/contexts/AuthContext";

interface ParentHeaderProps {
  title?: string;
  onOpenSOS?: () => void;
  unreadCount?: number;
}

export const ParentHeader: React.FC<ParentHeaderProps> = ({
  onOpenSOS,
  unreadCount = 1,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#111A24]/95 backdrop-blur-md border-b border-[#E2EEF1] dark:border-[#1E2C3A] px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between w-full">
        {/* Left: Mobile Brand Logo (Always visible across all screens) */}
        <div
          className="flex items-center cursor-pointer select-none active:opacity-85 transition-opacity"
          onClick={() => navigate("/parent")}
        >
          <FamCareLogo size="sm" hideTagline={false} />
        </div>

        {/* Right: Quick SOS, Notifications Bell, Avatar */}
        <div className="flex items-center gap-2">
          {onOpenSOS && (
            <button
              onClick={onOpenSOS}
              aria-label="Emergency SOS"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#EF4444] text-white text-xs font-bold shadow-sm shadow-[#EF4444]/25 active:scale-95 transition-transform"
            >
              <AlertTriangle className="w-3.5 h-3.5 fill-white" />
              <span>SOS</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => navigate("/parent/notifications")}
            className="relative w-9 h-9 rounded-full bg-[#F4FAFC] dark:bg-[#182330] hover:bg-[#EBF5F8] dark:hover:bg-[#1F2F40] border border-[#E2EEF1] dark:border-[#223344] flex items-center justify-center text-[#60738F] dark:text-[#A0B0C0] transition-colors active:scale-95"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-[#102443] dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#111A24]" />
            )}
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={() => navigate("/parent/more")}
            className="w-9 h-9 rounded-full bg-[#E6F8F7] dark:bg-[#159FA6]/20 border border-[#42C5C9]/40 flex items-center justify-center text-[#159FA6] dark:text-[#42C5C9] font-bold text-xs shadow-sm transition-transform active:scale-95 overflow-hidden"
            title="Account & Settings"
            aria-label="Account and Settings"
          >
            {profile?.full_name ? (
              profile.full_name.charAt(0).toUpperCase()
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default ParentHeader;
