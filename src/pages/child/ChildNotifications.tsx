import React, { useState } from "react";
import {
  Bell,
  Heart,
  Pill,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Check,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ChildLayout } from "@/components/child/ChildLayout";
import { useNotifications } from "@/contexts/NotificationContext";

export const ChildNotifications: React.FC = () => {
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
  const [filter, setFilter] = useState<"all" | "health" | "medicine" | "appointment" | "sos">("all");

  const mapTypeToCategory = (type: string): "health" | "medicine" | "appointment" | "sos" => {
    switch (type) {
      case "medication":
      case "medicine":
        return "medicine";
      case "appointment":
        return "appointment";
      case "sos":
        return "sos";
      case "health":
      case "health_warning":
      case "care":
      case "check_in":
      default:
        return "health";
    }
  };

  const formatTimestamp = (isoString?: string): string => {
    if (!isoString) return "Recently";
    try {
      const d = new Date(isoString);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return `Today, ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
      }
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  const items = notifications.map((n) => ({
    id: n.id,
    category: mapTypeToCategory(n.type),
    title: n.title,
    message: n.message,
    timestamp: formatTimestamp(n.created_at),
    read: n.read,
  }));

  const filtered = items.filter(
    (n) => filter === "all" || n.category === filter
  );

  const markAllRead = async () => {
    await markAllAsRead();
  };

  const toggleRead = async (id: string) => {
    await markAsRead(id);
  };

  const getCategoryConfig = (cat: NotificationItem["category"]) => {
    switch (cat) {
      case "medicine":
        return { icon: Pill, color: "text-[#8960D0] bg-[#F0EAFE]" };
      case "appointment":
        return { icon: Calendar, color: "text-[#5369D7] bg-[#E8F4FD]" };
      case "health":
        return { icon: Heart, color: "text-[#D83A6F] bg-[#FFEBF0]" };
      case "sos":
        return { icon: AlertTriangle, color: "text-[#EF4444] bg-red-100" };
    }
  };

  return (
    <ChildLayout title="Notifications">
      <div className="space-y-4 max-w-lg mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-[#172443] dark:text-white">
              Notifications
            </h1>
            <p className="text-xs text-[#64718B] dark:text-[#A0B0C0]">
              Stay informed on reminders & family updates
            </p>
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs font-bold text-[#8960D0] hover:underline"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(["all", "medicine", "appointment", "health", "sos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-[#5369D7] to-[#8960D0] text-white shadow-sm"
                  : "bg-white dark:bg-[#161F2C] border border-[#EAF0FF] dark:border-[#202F40] text-[#64718B] hover:text-[#172443]"
              }`}
            >
              {f === "all" ? "All Updates" : f}
            </button>
          ))}
        </div>

        {/* Push Notification Opt-in Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F0EAFE]/80 to-[#E8F4FD]/80 dark:bg-purple-950/20 border border-[#8960D0]/20 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#161F2C] flex items-center justify-center flex-shrink-0 shadow-xs">
                {isPushEnabled ? (
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                ) : pushPermission === "denied" ? (
                  <AlertCircle className="w-5 h-5 text-[#EF4444]" />
                ) : (
                  <BellRing className="w-5 h-5 text-[#8960D0]" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#172443] dark:text-white">
                    {isPushEnabled
                      ? "Push Notifications On"
                      : pushPermission === "denied"
                      ? "Alerts Blocked in Browser"
                      : "Family Push Alerts"}
                  </h4>
                  {isPushEnabled && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] dark:bg-[#064E3B] dark:text-[#A7F3D0]">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#64718B] dark:text-[#A0B0C0] leading-relaxed">
                  {isPushEnabled
                    ? "You will get friendly medicine reminders and family messages even when the app is asleep."
                    : pushPermission === "denied"
                    ? "Notifications were blocked in your browser. Turn them back on in site settings to get reminders."
                    : "Get friendly medicine reminders and doctor visit alerts right on your phone screen."}
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
                  {isPushLoading ? "..." : "Turn off"}
                </button>
              ) : pushPermission === "denied" ? (
                <span className="text-[11px] font-semibold text-[#EF4444]">Blocked</span>
              ) : (
                <button
                  onClick={() => enablePush()}
                  disabled={isPushLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5369D7] to-[#8960D0] hover:opacity-90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {isPushLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Turning on...</span>
                    </>
                  ) : (
                    <>
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Turn on</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification Cards */}
        <div className="space-y-2.5">
          {isLoading && notifications.length === 0 ? (
            <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-8 text-center border border-[#EAF0FF] dark:border-[#202F40] animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-[#5369D7] border-t-transparent animate-spin mx-auto mb-2" />
              <div className="text-xs text-[#64718B]">
                Loading your updates...
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#161F2C] rounded-3xl p-8 text-center border border-[#EAF0FF] dark:border-[#202F40]">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-[#172443] dark:text-white">
                No notifications in this filter
              </div>
              <div className="text-xs text-[#64718B] mt-1">
                You're all caught up!
              </div>
            </div>
          ) : (
            filtered.map((item) => {
              const conf = getCategoryConfig(item.category);
              const Icon = conf.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleRead(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    item.read
                      ? "bg-white/60 dark:bg-[#161F2C]/60 border-gray-100 dark:border-gray-800 opacity-80"
                      : "bg-white dark:bg-[#161F2C] border-[#EAF0FF] dark:border-[#202F40] shadow-sm"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${conf.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-[#172443] dark:text-white truncate">
                        {item.title}
                      </span>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#EF4444] flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#64718B] dark:text-[#A0B0C0] leading-relaxed mb-1">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ChildLayout>
  );
};

export default ChildNotifications;
