// ==============================================================================
// FAMCARE360: Firebase Cloud Messaging Integration
// Path: src/lib/firebase.ts
// ==============================================================================

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
  MessagePayload,
} from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";
import { APP_CONFIG } from "@/config";

// 1. Environment Configuration Validation
const firebaseConfig = {
  apiKey: APP_CONFIG.firebase.apiKey,
  authDomain: APP_CONFIG.firebase.authDomain,
  projectId: APP_CONFIG.firebase.projectId,
  storageBucket: APP_CONFIG.firebase.storageBucket,
  messagingSenderId: APP_CONFIG.firebase.messagingSenderId,
  appId: APP_CONFIG.firebase.appId,
};

const vapidKey = APP_CONFIG.firebase.vapidKey;

export const isFirebaseConfigValid = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId &&
      vapidKey
  );
};

// 2. Safe Singleton Firebase App Initializer
let app: FirebaseApp | null = null;
export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigValid()) return null;
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
};

// 3. Safe Messaging Instance Getter (checks browser compatibility)
let messagingInstance: Messaging | null = null;
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  const supported = await isSupported();
  if (!supported) return null;

  const fbApp = getFirebaseApp();
  if (!fbApp) return null;

  if (!messagingInstance) {
    messagingInstance = getMessaging(fbApp);
  }
  return messagingInstance;
};

// 4. Notification Permission Status Checker
export type PushPermissionState = "default" | "granted" | "denied" | "unsupported";

export const getPushPermissionState = async (): Promise<PushPermissionState> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  const supported = await isSupported();
  if (!supported) return "unsupported";

  return Notification.permission as PushPermissionState;
};

// 5. Explicit Push Notification Permission Request & Device Token Registration
export interface TokenRegistrationResult {
  success: boolean;
  token?: string;
  status: PushPermissionState;
  error?: string;
}

export const requestPushPermissionAndGetToken = async (
  userId: string
): Promise<TokenRegistrationResult> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return { success: false, status: "unsupported", error: "Browser does not support notifications." };
    }

    const supported = await isSupported();
    if (!supported) {
      return { success: false, status: "unsupported", error: "Firebase Cloud Messaging is not supported in this browser." };
    }

    // 1. Explicit user browser permission prompt
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        status: permission as PushPermissionState,
        error: permission === "denied"
          ? "Notification permission was blocked in browser settings."
          : "Notification permission was dismissed.",
      };
    }

    // 2. Register Service Worker with config query parameters
    const swUrl = `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(firebaseConfig.apiKey)}&projectId=${encodeURIComponent(firebaseConfig.projectId)}&messagingSenderId=${encodeURIComponent(firebaseConfig.messagingSenderId)}&appId=${encodeURIComponent(firebaseConfig.appId)}`;
    const registration = await navigator.serviceWorker.register(swUrl, { scope: "/" });
    await navigator.serviceWorker.ready;

    // 3. Acquire FCM Registration Token
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      return { success: false, status: "unsupported", error: "Could not initialize messaging instance." };
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { success: false, status: "granted", error: "No registration token returned by Firebase." };
    }

    // 4. Persist Device Token to Supabase device_tokens table
    const platform = "web";
    const userAgent = navigator.userAgent;
    const deviceInfo = /Mobi|Android/i.test(userAgent) ? "Mobile Browser" : "Desktop Browser";

    let dbSuccess = false;
    let dbErrorMessage: string | undefined;

    // A. Attempt secure RPC if configured in Supabase
    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc("register_device_token", {
        p_token: token,
        p_device_info: deviceInfo,
        p_platform: platform,
        p_user_agent: userAgent,
      });

      if (!rpcErr && rpcData?.success) {
        dbSuccess = true;
      }
    } catch {
      // RPC may not yet be defined in database; fall through to direct RLS upsert
    }

    // B. Direct table upsert under RLS
    if (!dbSuccess) {
      const { error: dbError } = await supabase.from("device_tokens").upsert(
        {
          user_id: userId,
          token: token,
          device_info: deviceInfo,
          platform: platform,
          user_agent: userAgent,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );

      if (dbError) {
        dbErrorMessage = dbError.message;
        console.warn("Supabase device_tokens upsert error:", dbError.message);
      } else {
        dbSuccess = true;
      }
    }

    // Never silently report success if database persistence failed
    if (!dbSuccess) {
      return {
        success: false,
        status: "granted",
        error: dbErrorMessage
          ? `Device token could not be saved to database: ${dbErrorMessage}`
          : "Failed to save device token in database.",
      };
    }

    // Cache current token locally scoped to this authenticated user
    localStorage.setItem(`famcare360_fcm_token_${userId}`, token);
    localStorage.setItem(`famcare360_push_enabled_${userId}`, "true");
    localStorage.setItem("famcare360_fcm_token", token);
    localStorage.setItem("famcare360_push_enabled", "true");

    return {
      success: true,
      token,
      status: "granted",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error during push token registration";
    console.error("requestPushPermissionAndGetToken error:", msg);
    return { success: false, status: "default", error: msg };
  }
};

// 6. Disable Push Notifications & Remove Device Token
export const unregisterDeviceToken = async (userId: string): Promise<boolean> => {
  try {
    const currentToken =
      localStorage.getItem(`famcare360_fcm_token_${userId}`) ||
      localStorage.getItem("famcare360_fcm_token");

    if (currentToken) {
      // Remove this device registration row for this user to release physical token
      await supabase
        .from("device_tokens")
        .delete()
        .eq("token", currentToken)
        .eq("user_id", userId);
    } else {
      // Remove all device tokens for this user on this browser
      await supabase
        .from("device_tokens")
        .delete()
        .eq("user_id", userId);
    }

    localStorage.removeItem(`famcare360_fcm_token_${userId}`);
    localStorage.setItem(`famcare360_push_enabled_${userId}`, "false");
    localStorage.removeItem("famcare360_fcm_token");
    localStorage.setItem("famcare360_push_enabled", "false");
    return true;
  } catch (err) {
    console.warn("unregisterDeviceToken warning:", err);
    return false;
  }
};

// 7. Foreground Notification Handler
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void
): (() => void) | null => {
  let unsubscribe: (() => void) | null = null;

  getFirebaseMessaging().then((messaging) => {
    if (messaging) {
      unsubscribe = onMessage(messaging, (payload) => {
        console.log("[FCM Foreground] Message received:", payload);
        callback(payload);
      });
    }
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};
