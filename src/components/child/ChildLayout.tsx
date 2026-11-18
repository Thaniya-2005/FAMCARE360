import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { ChildHeader } from "./ChildHeader";
import { ChildBottomNav } from "./ChildBottomNav";
import { ChildEmergencySOSDialog } from "./ChildEmergencySOSDialog";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

interface ChildLayoutProps {
  children: React.ReactNode;
  title?: string;
  currentVitals?: {
    heartRate?: number;
    temperature?: number;
  };
}

export const ChildLayout: React.FC<ChildLayoutProps> = ({
  children,
  title,
  currentVitals,
}) => {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, profile } = useAuth();

  const userRole = (profile?.role || user?.user_metadata?.role) as "parent" | "child" | undefined;
  if (userRole === "parent") {
    return <Navigate to="/parent" replace />;
  }

  return (
    <div className="min-h-screen bg-[#EEF1F8] dark:bg-[#070D14] flex justify-center items-start antialiased selection:bg-[#5369D7]/20">
      {/* Mobile-Only Portrait Phone Container (Strictly 430-460px max width centered on desktop, 100% on mobile) */}
      <div className="w-full max-w-[460px] min-h-screen bg-[#F6F7FC] dark:bg-[#0B131C] text-[#172443] dark:text-[#EAF0FF] flex flex-col font-sans relative shadow-2xl sm:border-x sm:border-[#E2E8F0] dark:sm:border-[#1E293B] transition-colors duration-200">
        {/* Compact Mobile Top Header */}
        <ChildHeader
          title={title}
          onOpenSOS={() => setIsSOSOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Page Content Viewport - Single-column mobile layout with dedicated bottom padding for fixed navigation */}
        <main className="flex-1 px-4 py-4 w-full pb-28 overflow-x-hidden">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (Centered within the 460px mobile viewport) */}
        <ChildBottomNav />

        {/* Emergency SOS Confirmation Dialog */}
        <ChildEmergencySOSDialog
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          currentVitals={currentVitals}
        />
      </div>
    </div>
  );
};

export default ChildLayout;
