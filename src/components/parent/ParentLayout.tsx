import React, { useState } from "react";
import { ParentHeader } from "./ParentHeader";
import { ParentBottomNav } from "./ParentBottomNav";
import { EmergencySOSDialog } from "./EmergencySOSDialog";
import { useNotifications } from "@/contexts/NotificationContext";

interface ParentLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const ParentLayout: React.FC<ParentLayoutProps> = ({ children, title }) => {
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#070D14] flex justify-center items-start antialiased selection:bg-[#159FA6]/20">
      {/* Mobile-Only Portrait Container (Strictly 460px max width centered on desktop, 100% on mobile) */}
      <div className="w-full max-w-[460px] min-h-screen bg-[#F4FAFC] dark:bg-[#0B131C] text-[#102443] dark:text-[#E2EEF1] flex flex-col font-sans relative shadow-2xl sm:border-x sm:border-[#E2EEF1] dark:sm:border-[#1E293B] transition-colors duration-200">
        {/* Compact Mobile Top Header */}
        <ParentHeader
          title={title}
          onOpenSOS={() => setIsSOSOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Page Content Viewport - Single-column mobile layout with dedicated bottom padding for fixed navigation */}
        <main className="flex-1 px-4 py-4 w-full pb-28 overflow-x-hidden">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (Centered within the 460px mobile viewport) */}
        <ParentBottomNav />

        {/* Emergency SOS Confirmation Dialog */}
        <EmergencySOSDialog
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
        />
      </div>
    </div>
  );
};

export default ParentLayout;
