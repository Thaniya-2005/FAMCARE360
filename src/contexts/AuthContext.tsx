import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthStatus =
  | "initializing"
  | "unauthenticated"
  | "authenticated"
  | "loading_profile"
  | "profile_loaded"
  | "profile_unavailable"
  | "auth_error";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: "parent" | "child";
  phone: string | null;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: "parent" | "child";
  relationship: string | null;
  profile?: Profile | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  family: Family | null;
  familyMembers: FamilyMember[];
  loading: boolean;
  status: AuthStatus;
  authError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  family: null,
  familyMembers: [],
  loading: true,
  status: "initializing",
  authError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshFamily: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [authError, setAuthError] = useState<string | null>(null);

  // Derived loading state with hard guarantee
  const loading = status === "initializing" || status === "loading_profile";

  const fetchProfile = useCallback(async (currUser: User): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", currUser.id)
        .maybeSingle();

      if (!error && data) {
        const p = data as Profile;
        setProfile(p);
        return p;
      }

      // Fallback: derive initial profile from user metadata if table not yet populated
      const role = (currUser.user_metadata?.role as "parent" | "child") || "parent";
      const fullName = (currUser.user_metadata?.full_name as string) || currUser.email?.split("@")[0] || null;
      const fallback: Profile = {
        id: currUser.id,
        user_id: currUser.id,
        full_name: fullName,
        role,
        phone: currUser.phone || null,
      };
      setProfile(fallback);
      return fallback;
    } catch (err) {
      console.warn("fetchProfile error, applying metadata fallback:", err);
      const role = (currUser.user_metadata?.role as "parent" | "child") || "parent";
      const fallback: Profile = {
        id: currUser.id,
        user_id: currUser.id,
        full_name: (currUser.user_metadata?.full_name as string) || null,
        role,
        phone: null,
      };
      setProfile(fallback);
      return fallback;
    }
  }, []);

  const fetchFamily = useCallback(async (currUser: User) => {
    try {
      // 1. Check family_members table
      const { data: memberRows, error: mErr } = await supabase
        .from("family_members")
        .select("*, families(*)")
        .eq("user_id", currUser.id);

      if (!mErr && memberRows && memberRows.length > 0) {
        const primaryFam = (memberRows[0] as Record<string, unknown>).families as Family | undefined;
        if (primaryFam) setFamily(primaryFam);

        // Fetch all members in this family
        const { data: allMembers } = await supabase
          .from("family_members")
          .select("*")
          .eq("family_id", memberRows[0].family_id);

        if (allMembers) {
          setFamilyMembers(allMembers as FamilyMember[]);
        }
        return;
      }

      // 2. Fallback: check families created by user
      const { data: createdFams } = await supabase
        .from("families")
        .select("*")
        .eq("created_by", currUser.id)
        .maybeSingle();

      if (createdFams) {
        setFamily(createdFams as Family);
      }
    } catch (err) {
      console.warn("fetchFamily caught error:", err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      setStatus("loading_profile");
      const p = await fetchProfile(user);
      setStatus(p ? "profile_loaded" : "profile_unavailable");
    }
  }, [user, fetchProfile]);

  const refreshFamily = useCallback(async () => {
    if (user) await fetchFamily(user);
  }, [user, fetchFamily]);

  useEffect(() => {
    let isMounted = true;
    let authInitialized = false;

    const handleSessionResolution = async (activeSession: Session | null) => {
      if (!isMounted) return;
      setSession(activeSession);
      const activeUser = activeSession?.user ?? null;
      setUser(activeUser);

      if (!activeUser) {
        setProfile(null);
        setFamily(null);
        setFamilyMembers([]);
        setStatus("unauthenticated");
        return;
      }

      // User exists, load profile
      setStatus("loading_profile");
      try {
        const loadedProfile = await fetchProfile(activeUser);
        // Load family non-blocking in background so UI renders immediately
        fetchFamily(activeUser).catch((e) => console.warn("Background family load:", e));

        if (isMounted) {
          if (loadedProfile) {
            setStatus("profile_loaded");
          } else {
            setStatus("profile_unavailable");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Profile load failure:", err);
          setStatus("profile_unavailable");
        }
      }
    };

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn("getSession error:", error.message);
        setAuthError(error.message);
      }
      if (!authInitialized) {
        authInitialized = true;
        handleSessionResolution(initSession);
      }
    }).catch((err) => {
      if (!isMounted) return;
      console.warn("getSession promise rejection:", err);
      if (!authInitialized) {
        authInitialized = true;
        setStatus("unauthenticated");
      }
    });

    // 2. Auth State Listener (Single, handles SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;

        if (event === "SIGNED_OUT" || !newSession) {
          authInitialized = true;
          setSession(null);
          setUser(null);
          setProfile(null);
          setFamily(null);
          setFamilyMembers([]);
          setStatus("unauthenticated");
          return;
        }

        // On initial session, sign in, or token refresh
        authInitialized = true;
        handleSessionResolution(newSession);
      }
    );

    // 3. Absolute Safeguard Timer: never leave application stuck loading > 3.5s
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        setStatus((prev) => {
          if (prev === "initializing" || prev === "loading_profile") {
            console.warn("⚠️ AuthContext safety timeout reached. Forcing loading resolution.");
            return prev === "initializing" ? "unauthenticated" : "profile_loaded";
          }
          return prev;
        });
      }
    }, 3500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile, fetchFamily]);

  const signOut = async () => {
    // Unregister device push token before signing out
    if (user?.id) {
      try {
        const { unregisterDeviceToken } = await import("@/lib/firebase");
        await unregisterDeviceToken(user.id);
      } catch (fcmErr) {
        console.warn("FCM device unregister error during signOut:", fcmErr);
      }
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on signout
    }
    setProfile(null);
    setFamily(null);
    setFamilyMembers([]);
    setUser(null);
    setSession(null);
    setStatus("unauthenticated");
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        family,
        familyMembers,
        loading,
        status,
        authError,
        signOut,
        refreshProfile,
        refreshFamily,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
