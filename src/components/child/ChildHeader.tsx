import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, AlertTriangle } from "lucide-react";
import { FamCareLogo } from "../parent/FamCareLogo";
import { useAuth } from "@/contexts/AuthContext";

interface ChildHeaderProps {
  title?: string;
  onOpenSOS?: () => void;
  unreadCount?: number;
}

export const ChildHeader: React.FC<ChildHeaderProps> = ({
  onOpenSOS,
  unreadCount = 1,
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-[#111A24]/95 backdrop-blur-md border-b border-[#EAF0FF] dark:border-[#1E2C3A] px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between w-full">
        {/* Left: Mobile Brand Logo (Always visible across all screens) */}
        <div
          className="flex items-center cursor-pointer select-none active:opacity-85 transition-opacity"
          onClick={() => navigate("/child")}
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
            onClick={() => navigate("/child/notifications")}
            className="relative w-9 h-9 rounded-full bg-[#F6F7FC] dark:bg-[#182330] hover:bg-[#EAF0FF] dark:hover:bg-[#1F2F40] border border-[#EAF0FF] dark:border-[#223344] flex items-center justify-center text-[#64718B] dark:text-[#A0B0C0] transition-colors active:scale-95"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5 text-[#172443] dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#EF4444] ring-2 ring-white dark:ring-[#111A24]" />
            )}
          </button>

          {/* Child Profile Avatar Button */}
          <button
            onClick={() => navigate("/child/profile")}
            className="w-9 h-9 rounded-full bg-[#EAF0FF] dark:bg-[#5369D7]/20 border-2 border-[#5369D7]/40 flex items-center justify-center text-[#5369D7] dark:text-[#8960D0] font-bold text-xs shadow-sm transition-transform active:scale-95 overflow-hidden"
            title="My Profile"
            aria-label="My Profile"
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#5369D7]/20 to-[#8960D0]/20 text-[#5369D7] dark:text-white">
              {profile?.full_name ? (
                profile.full_name.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ChildHeader;
