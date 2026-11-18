import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Heart, Layers, LayoutGrid } from "lucide-react";

export const ParentBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[460px] z-40 bg-white/95 dark:bg-[#111A24]/95 backdrop-blur-md border-t border-[#E2EEF1] dark:border-[#1E2C3A] sm:border-x sm:border-[#E2EEF1] dark:sm:border-[#1E293B] px-2 py-2 shadow-lg shadow-black/5 transition-all">
      <div className="flex items-center justify-around w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 relative ${
                active
                  ? "text-[#159FA6] dark:text-[#42C5C9] font-bold"
                  : "text-[#60738F] dark:text-[#A0B0C0] font-medium hover:text-[#102443]"
              }`}
            >
              {/* Active pill background effect matching reference */}
              {active && (
                <div className="absolute inset-x-2 -top-1 bottom-0 bg-[#E6F8F7] dark:bg-[#159FA6]/20 rounded-xl -z-10" />
              )}
              <Icon
                className={`w-5 h-5 mb-1 transition-transform ${
                  active ? "scale-110 text-[#159FA6] dark:text-[#42C5C9]" : ""
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

export default ParentBottomNav;
