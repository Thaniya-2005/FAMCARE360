import { ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, RefreshCw, LogOut, ShieldAlert, ArrowRight } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"parent" | "child">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, user, profile, loading, status, refreshProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Session initialization is genuinely pending
  if (loading || status === "initializing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Verifying session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: send to login with originating location state
  if (!session || !user || status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Profile is currently loading
  if (status === "loading_profile") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Loading profile...</p>
      </div>
    );
  }

  // 4. Profile unavailable: recoverable state with clear retry/signout actions
  if (status === "profile_unavailable" && !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full text-center shadow-lg">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">Profile Unavailable</h2>
          <p className="text-xs text-muted-foreground mb-4">
            We couldn't retrieve your user profile from the database. Please try refreshing.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => refreshProfile()}
              className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-muted transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Strict Role Validation & Cross-role route protection
  const userRole = (profile?.role || user.user_metadata?.role) as "parent" | "child" | undefined;

  // Fail-closed: If role is completely missing or unrecognized, send to login
  if (!userRole || (userRole !== "parent" && userRole !== "child")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if role is authorized for this route
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const destinationPath = userRole === "parent" ? "/parent" : "/child";
    const requiredRoleName = allowedRoles.map((r) => r.toUpperCase()).join(" or ");

    return (
      <div className="min-h-screen bg-[#EEF2F6] dark:bg-[#070D14] flex justify-center items-center p-4 antialiased">
        <div className="w-full max-w-[420px] bg-card border border-border rounded-3xl p-6 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1.5">Access Restricted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This page requires a <span className="font-semibold text-foreground">{requiredRoleName}</span> account. You are currently signed in as a <span className="font-semibold text-primary uppercase">{userRole}</span>.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => navigate(destinationPath, { replace: true })}
              className="w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-md transition-all"
            >
              <span>Go to {userRole === "parent" ? "Parent Dashboard" : "Child Dashboard"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => signOut()}
              className="w-full py-2.5 px-4 rounded-2xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
