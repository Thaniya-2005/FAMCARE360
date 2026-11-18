import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, RefreshCw, LogOut } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<"parent" | "child">;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { session, user, profile, loading, status, refreshProfile, signOut } = useAuth();
  const location = useLocation();

  // 1. Session initialization is genuinely pending
  if (loading || status === "initializing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Verifying session...</p>
      </div>
    );
  }

  // 2. Unauthenticated: send to login
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

  // 4. Profile unavailable: recoverable state, NEVER an infinite spinner
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

  // 5. Role Validation & Cross-role route protection
  const userRole = profile?.role || (user.user_metadata?.role as "parent" | "child") || "parent";

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    const destinationPath = userRole === "parent" ? "/parent" : "/child";
    // Avoid redirect loop if already at target
    if (location.pathname !== destinationPath) {
      return <Navigate to={destinationPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
