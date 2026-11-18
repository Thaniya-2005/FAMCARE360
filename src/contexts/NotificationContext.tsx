import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { healthService, NotificationRecord } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";
import {
  getPushPermissionState,
  requestPushPermissionAndGetToken,
  unregisterDeviceToken,
  onForegroundMessage,
  PushPermissionState,
  TokenRegistrationResult,
} from "@/lib/firebase";

interface NotificationContextType {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  pushPermission: PushPermissionState;
  isPushEnabled: boolean;
  isPushLoading: boolean;
  enablePush: () => Promise<TokenRegistrationResult>;
  disablePush: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Push notification state
  const [pushPermission, setPushPermission] = useState<PushPermissionState>("default");
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(false);
  const [isPushLoading, setIsPushLoading] = useState<boolean>(false);

  // Probe push permission state on mount and when authenticated user changes
  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setIsPushEnabled(false);
      setPushPermission("default");
      return;
    }

    getPushPermissionState().then(async (perm) => {
      if (!isMounted) return;
      setPushPermission(perm);

      // Check user-scoped local cache
      const cachedEnabled =
        localStorage.getItem(`famcare360_push_enabled_${user.id}`) === "true";

      if (perm === "granted") {
        try {
          // Authoritatively verify against Supabase device_tokens table
          const { data, error } = await supabase
            .from("device_tokens")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .limit(1);

          if (isMounted) {
            if (!error && data) {
              const hasActiveToken = data.length > 0;
              setIsPushEnabled(hasActiveToken);
              localStorage.setItem(
                `famcare360_push_enabled_${user.id}`,
                hasActiveToken ? "true" : "false"
              );
            } else {
              setIsPushEnabled(cachedEnabled);
            }
          }
        } catch {
          if (isMounted) {
            setIsPushEnabled(cachedEnabled);
          }
        }
      } else {
        setIsPushEnabled(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const records = await healthService.getNotifications(user.id);
      setNotifications(records);
      const unread = records.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("NotificationContext load warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load initial notifications on user change
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Supabase Realtime channel subscription
  useEffect(() => {
    if (!user) return;

    const channelName = `realtime_notifications_${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as NotificationRecord;
            setNotifications((prev) => {
              // Deduplication by id
              if (prev.some((n) => n.id === newRecord.id)) {
                return prev;
              }
              return [newRecord, ...prev];
            });

            if (!newRecord.read) {
              setUnreadCount((c) => c + 1);
            }

            // Display live toast for incoming real-time notifications
            const isHighPriority = newRecord.type === "sos" || newRecord.type === "health_warning";
            toast({
              title: newRecord.title,
              description: newRecord.message,
              variant: isHighPriority ? "destructive" : "default",
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as NotificationRecord;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedRecord.id ? updatedRecord : n))
            );
            setNotifications((currentList) => {
              const unread = currentList.filter((n) => !n.read).length;
              setUnreadCount(unread);
              return currentList;
            });
          } else if (payload.eventType === "DELETE") {
            const oldRecord = payload.old as { id: string };
            setNotifications((prev) => {
              const filtered = prev.filter((n) => n.id !== oldRecord.id);
              setUnreadCount(filtered.filter((n) => !n.read).length);
              return filtered;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  // Firebase Cloud Messaging: Listen for foreground push messages
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      const title =
        payload.notification?.title ||
        (payload.data?.title as string) ||
        "FamCare360 Alert";
      const message =
        payload.notification?.body ||
        (payload.data?.body as string) ||
        "New family update received.";
      const isUrgent =
        payload.data?.type === "sos" ||
        payload.data?.type === "health_warning";

      toast({
        title,
        description: message,
        variant: isUrgent ? "destructive" : "default",
      });

      // Reload in-app notifications
      loadNotifications();
    });

    return () => {
      if (unsub) unsub();
    };
  }, [loadNotifications, toast]);

  // Explicit user permission opt-in handler
  const enablePush = async (): Promise<TokenRegistrationResult> => {
    if (!user) {
      return {
        success: false,
        status: "default",
        error: "User is not authenticated.",
      };
    }

    setIsPushLoading(true);
    try {
      const res = await requestPushPermissionAndGetToken(user.id);
      setPushPermission(res.status);
      setIsPushEnabled(res.success);

      if (res.success) {
        toast({
          title: "Push Notifications Enabled ✓",
          description:
            "This device will receive instant background alerts for health and emergency updates.",
        });
      } else if (res.status === "denied") {
        toast({
          title: "Notifications Blocked",
          description:
            "Permission was blocked in browser settings. Please allow notifications for this site to receive alerts.",
          variant: "destructive",
        });
      } else if (res.error) {
        toast({
          title: "Push Setup Notice",
          description: res.error,
          variant: "destructive",
        });
      }

      return res;
    } finally {
      setIsPushLoading(false);
    }
  };

  // Opt-out / Device unregistration handler
  const disablePush = async (): Promise<boolean> => {
    if (!user) return false;

    setIsPushLoading(true);
    try {
      const success = await unregisterDeviceToken(user.id);
      setIsPushEnabled(false);
      setPushPermission("default");
      toast({
        title: "Push Notifications Disabled",
        description:
          "Push notifications have been turned off for this browser session.",
      });
      return success;
    } finally {
      setIsPushLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    await healthService.markNotificationRead(id);
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    await healthService.markAllNotificationsRead(user.id);
    toast({
      title: "All Notifications Read ✓",
      description: "Your notification inbox is completely up to date.",
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
        pushPermission,
        isPushEnabled,
        isPushLoading,
        enablePush,
        disablePush,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
