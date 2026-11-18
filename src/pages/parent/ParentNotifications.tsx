import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, AlertTriangle, Heart, Calendar,
  Pill, ArrowLeft, Sparkles, BellRing, CheckCircle2,
  AlertCircle, Loader2
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { useNotifications } from "@/contexts/NotificationContext";

export const ParentNotifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    pushPermission,
    isPushEnabled,
    isPushLoading,
    enablePush,
    disablePush,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread" | "sos" | "health">("all");

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const filteredList = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "sos") return n.type === "sos";
    if (filter === "health") return n.type === "health" || n.type === "vital" || n.type === "health_warning" || n.type === "care";
    return true;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "sos":
        return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
      case "health":
        return <Heart className="w-5 h-5 text-[#159FA6]" />;
      case "appointment":
        return <Calendar className="w-5 h-5 text-[#2563EB]" />;
      case "medication":
        return <Pill className="w-5 h-5 text-[#9333EA]" />;
      default:
        return <Bell className="w-5 h-5 text-[#159FA6]" />;
    }
  };

  return (
    <ParentLayout title="Notifications">
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#60738F] hover:text-[#102443] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleMarkAllRead}
            disabled={notifications.filter((n) => !n.read).length === 0}
            className="flex items-center gap-1.5 text-xs font-bold text-[#159FA6] dark:text-[#42C5C9] hover:underline disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Alerts" },
            { id: "unread", label: "Unread" },
            { id: "health", label: "Health & Vitals" },
            { id: "sos", label: "Emergency SOS" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as typeof filter)}
              className={`py-1.5 px-3.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === item.id
                  ? "bg-[#159FA6] text-white shadow-sm"
                  : "bg-white dark:bg-[#111A24] text-[#60738F] border border-[#E2EEF1] dark:border-[#1E2C3A]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Push Notification Opt-in / Status Card */}
        <div className="p-4 rounded-2xl bg-[#F0FBFA] dark:bg-[#11232B] border border-[#159FA6]/30 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#159FA6]/10 dark:bg-[#159FA6]/20 flex items-center justify-center flex-shrink-0 text-[#159FA6]">
                {isPushEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : pushPermission === "denied" ? (
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                ) : (
                  <BellRing className="w-5 h-5 text-[#159FA6]" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#102443] dark:text-white">
                    {isPushEnabled
                      ? "Push Notifications Enabled"
                      : pushPermission === "denied"
                      ? "Push Alerts Blocked"
                      : "Mobile Push Notifications"}
                  </h4>
                  {isPushEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#A7F3D0]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#60738F] dark:text-[#94A3B8] leading-relaxed">
                  {isPushEnabled
                    ? "This device is registered to receive background alerts for SOS and health updates even when closed."
                    : pushPermission === "denied"
                    ? "Notifications were blocked in your browser settings. Please allow notifications in site settings to receive push alerts."
                    : "Receive instant family health alerts, check-in updates, and Emergency SOS on your device."}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0">
              {isPushEnabled ? (
                <button
                  onClick={() => disablePush()}
                  disabled={isPushLoading}
                  className="text-[11px] font-bold text-[#EF4444] hover:underline disabled:opacity-50"
                >
                  {isPushLoading ? "Updating..." : "Disable"}
                </button>
              ) : pushPermission === "denied" ? (
                <span className="text-[11px] font-semibold text-[#EF4444]">Blocked</span>
              ) : (
                <button
                  onClick={() => enablePush()}
                  disabled={isPushLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#159FA6] hover:bg-[#0D878D] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {isPushLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enabling...</span>
                    </>
                  ) : (
                    <>
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredList.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                notif.read
                  ? "bg-white dark:bg-[#111A24] border-[#E2EEF1] dark:border-[#1E2C3A] opacity-75"
                  : "bg-white dark:bg-[#152332] border-[#159FA6]/40 shadow-sm ring-1 ring-[#159FA6]/20"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F4FAFC] dark:bg-[#1E2C3A] flex items-center justify-center flex-shrink-0 mt-0.5">
                {getCategoryIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-bold text-sm text-[#102443] dark:text-white truncate">
                    {notif.title}
                  </h5>
                  <span className="text-[11px] text-[#60738F] whitespace-nowrap">
                    {new Date(notif.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#60738F] dark:text-[#A0B0C0] mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(notif.link!);
                    }}
                    className="text-xs font-bold text-[#159FA6] mt-2 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>View Record</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#159FA6] flex-shrink-0 mt-2" />
              )}
            </div>
          ))}

          {isLoading && notifications.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#111A24] rounded-3xl border border-[#E2EEF1] dark:border-[#1E2C3A] p-6 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-[#159FA6] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#60738F]">Loading alerts and notifications...</p>
            </div>
          )}

          {!isLoading && filteredList.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#111A24] rounded-3xl border border-[#E2EEF1] dark:border-[#1E2C3A] p-6">
              <Bell className="w-10 h-10 text-[#90A4AE] mx-auto mb-3 opacity-40" />
              <h5 className="font-bold text-sm text-[#102443] dark:text-white">
                No notifications to display
              </h5>
              <p className="text-xs text-[#60738F] mt-1">
                You're completely up to date with family health alerts and updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </ParentLayout>
  );
};

export default ParentNotifications;
