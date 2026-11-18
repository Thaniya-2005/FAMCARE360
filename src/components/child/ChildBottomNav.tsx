import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, HeartPulse, ClipboardCheck, Calendar, User } from "lucide-react";

export const ChildBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/child", icon: Home },
    { label: "Health", path: "/child/health", icon: HeartPulse },
    { label: "Check-in", path: "/child/check-in", icon: ClipboardCheck },
    { label: "Appointments", path: "/child/appointments", icon: Calendar },
    { label: "Profile", path: "/child/profile", icon: User },
  ];

  const isActive = (path: string) => {
    if (path === "/child") return location.pathname === "/child";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 bg-white/95 dark:bg-[#111A24]/95 backdrop-blur-md border-t border-[#EAF0FF] dark:border-[#1E2C3A] sm:border-x sm:border-[#E2E8F0] dark:sm:border-[#1E293B] px-2 py-2 shadow-lg shadow-black/5 transition-all">
      <div className="flex items-center justify-around w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-150 relative ${
                active
                  ? "text-[#8960D0] dark:text-[#A78BFA] font-bold"
                  : "text-[#64718B] dark:text-[#A0B0C0] font-medium hover:text-[#172443]"
              }`}
            >
              {/* Active pill background matching reference */}
              {active && (
                <div className="absolute inset-x-2 -top-1 bottom-0 bg-[#F0EAFE] dark:bg-[#8960D0]/20 rounded-2xl -z-10" />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  active ? "scale-110 text-[#8960D0] dark:text-[#A78BFA]" : ""
                }`}
              />
              <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default ChildBottomNav;
