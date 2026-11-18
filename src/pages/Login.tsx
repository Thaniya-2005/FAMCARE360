import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart, Mail, Lock, User, Eye, EyeOff, Shield, Baby, ChevronRight,
  ArrowLeft, Plus, Trash2, Loader2, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { healthService } from "@/services/healthService";
import { useAuth } from "@/contexts/AuthContext";

interface ChildInfo {
  name: string;
  age: string;
  healthDetails: string;
}

interface SupabaseAuthErrorLike {
  message?: string;
  name?: string;
  status?: number;
  code?: string;
  details?: string;
  hint?: string;
}

const formatAuthError = (err: unknown, defaultFallback: string = "Authentication error"): string => {
  if (!err) return defaultFallback;

  const errorObj = err as SupabaseAuthErrorLike;
  let rawMessage = typeof errorObj.message === "string" ? errorObj.message.trim() : "";

  // Guard against stringified empty object or generic empty representation
  if (rawMessage === "{}" || rawMessage === "[object Object]") {
    rawMessage = "";
  }

  const parts: string[] = [];

  if (rawMessage) {
    // Sanitize any accidentally leaked tokens, passwords, or API keys
    const sanitized = rawMessage
      .replace(/re_[a-zA-Z0-9_-]+/g, "re_***")
      .replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, "[REDACTED_TOKEN]");
    parts.push(sanitized);
  } else if (errorObj.status === 504) {
    parts.push("Gateway Timeout: The mail server or authentication service took too long to respond.");
  } else if (errorObj.status === 500) {
    parts.push("Internal Server Error: The authentication service encountered an unexpected error.");
  } else if (errorObj.name && errorObj.name !== "Error") {
    parts.push(errorObj.name);
  } else {
    parts.push(defaultFallback);
  }

  const metadata: string[] = [];
  if (errorObj.code && errorObj.code !== String(errorObj.status)) {
    metadata.push(`Code: ${errorObj.code}`);
  }
  if (errorObj.status) {
    metadata.push(`Status: ${errorObj.status}`);
  }
  if (errorObj.details) {
    metadata.push(`Details: ${errorObj.details}`);
  }
  if (errorObj.hint) {
    metadata.push(`Hint: ${errorObj.hint}`);
  }

  if (metadata.length > 0) {
    return `${parts.join(" ")} (${metadata.join(" | ")})`;
  }

  return parts.join(" ");
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile, loading: authLoading } = useAuth();

  const [role, setRole] = useState<"parent" | "child">("parent");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [children, setChildren] = useState<ChildInfo[]>([{ name: "", age: "", healthDetails: "" }]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 1. Auto-redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const targetRole = profile?.role || (user.user_metadata?.role as "parent" | "child") || "parent";
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
      if (fromPath && fromPath !== "/login") {
        navigate(fromPath, { replace: true });
      } else {
        navigate(targetRole === "parent" ? "/parent" : "/child", { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate, location.state]);

  useEffect(() => {
    // Check if role was passed via query param or location state
    const params = new URLSearchParams(location.search);
    const paramRole = params.get("role") || (location.state as { role?: string })?.role;
    if (paramRole === "child" || paramRole === "parent") {
      setRole(paramRole);
    }

    // Check remembered email
    const savedEmail = localStorage.getItem("famcare360_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [location]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup && !fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (isSignup && password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setConfirmationNotice(null);

    try {
      if (rememberMe) {
        localStorage.setItem("famcare360_remember_email", email.trim());
      } else {
        localStorage.removeItem("famcare360_remember_email");
      }

      if (isSignup) {
        // Sign Up Flow for both Parent and Child
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
              invite_code: inviteCode.trim().toUpperCase() || undefined,
            },
          },
        });

        if (error) throw error;

        // Check if account already exists with empty identities array
        if (data.user?.identities && data.user.identities.length === 0) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email address already exists. Please switch to the Login tab.",
            variant: "destructive",
          });
          setIsSignup(false);
          setIsLoading(false);
          return;
        }

        // When email confirmation is enabled, Supabase returns a user with no active session
        if (!data.session) {
          setConfirmationNotice(
            `A confirmation email has been sent to ${email.trim()}. Please check your inbox and click the verification link before logging in.`
          );
          toast({
            title: "Confirmation Required 📩",
            description: `Verification link sent to ${email.trim()}. Please verify your email before logging in.`,
          });
          setIsSignup(false); // Switch to login tab
          setIsLoading(false);
          return;
        }

        // If parent registered children during signup
        if (role === "parent" && data.user) {
          const validChildren = children.filter((c) => c.name.trim());
          if (validChildren.length > 0) {
            try {
              await supabase.from("children").insert(
                validChildren.map((c) => ({
                  parent_id: data.user!.id,
                  name: c.name.trim(),
                  age: c.age ? parseInt(c.age) : null,
                  health_details: c.healthDetails?.trim() || null,
                }))
              );
            } catch {
              // Ignore child table errors during signup
            }
          }
        }

        // Migrate local storage records to new account
        if (data.user) {
          await healthService.migrateLocalStorageToSupabase(data.user.id);
        }

        toast({
          title: "Account created! 🎉",
          description: `Welcome to FamCare360 as ${role === "parent" ? "a Parent" : "a Child/Caregiver"}.`,
        });

        navigate(role === "parent" ? "/parent" : "/child");
      } else {
        // Login Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        // Migrate any unmigrated local records
        if (data.user) {
          await healthService.migrateLocalStorageToSupabase(data.user.id);
        }

        // Determine destination role based on user metadata or selected tab
        const actualRole = (data.user?.user_metadata?.role as "parent" | "child") || role;

        toast({
          title: "Welcome back! 💚",
          description: `Logged in as ${actualRole}.`,
        });

        // Redirect to originating destination or assigned dashboard
        const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
        if (fromPath && fromPath !== "/login") {
          navigate(fromPath);
        } else {
          navigate(actualRole === "parent" ? "/parent" : "/child");
        }
      }
    } catch (err: unknown) {
      const message = formatAuthError(err, isSignup ? "Signup failed" : "Login failed");
      toast({
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrors({ email: "Enter your email to reset password" });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Reset link sent 📧",
        description: `Check ${email} for reset instructions.`,
      });
    } catch (err: unknown) {
      const message = formatAuthError(err, "Password reset failed");
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const addChild = () => setChildren([...children, { name: "", age: "", healthDetails: "" }]);
  const removeChild = (i: number) => setChildren(children.filter((_, idx) => idx !== i));
  const updateChild = (i: number, field: keyof ChildInfo, value: string) => {
    const updated = [...children];
    updated[i] = { ...updated[i], [field]: value };
    setChildren(updated);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 gradient-hero rounded-2xl flex items-center justify-center shadow-card">
              <Heart className="w-7 h-7 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            FamCare<span className="text-primary">360</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Caring for your family, smarter with FamCare 360 💚
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-muted rounded-2xl p-1.5 mb-6 shadow-sm">
          <button
            onClick={() => {
              setRole("parent");
              setErrors({});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "parent"
                ? "gradient-parent text-white shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" /> Parent
          </button>
          <button
            onClick={() => {
              setRole("child");
              setErrors({});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "child"
                ? "gradient-child text-white shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Baby className="w-4 h-4" /> Child
          </button>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          {/* Login / Sign Up Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-6">
            <button
              onClick={() => {
                setIsSignup(false);
                setErrors({});
                setShowChildForm(false);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsSignup(true);
                setErrors({});
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {confirmationNotice && (
            <div className="mb-5 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="leading-relaxed">
                <strong>Check your email:</strong> {confirmationNotice}
              </div>
            </div>
          )}

          {role === "child" && !isSignup && (
            <div className="mb-5 p-3 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                👋 Welcome! Log in to view your parent's health updates & daily tasks.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>
            )}

            {isSignup && role === "child" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Family Invite Code (Optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="e.g. FC-A1B2C3"
                    className="pl-10 uppercase"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ask your parent for their Family Invite Code to link automatically.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {isSignup && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              {!isSignup && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <Button
              disabled={isLoading}
              type="submit"
              className={`w-full h-12 text-base font-semibold rounded-xl shadow-card ${
                role === "parent" ? "gradient-parent" : "gradient-child"
              } text-white hover:opacity-90 transition-opacity`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignup ? "Create Account" : "Login"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {isSignup && role === "parent" && (
            <div className="mt-6 border-t border-border pt-5">
              <button
                onClick={() => setShowChildForm(!showChildForm)}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
              >
                <Plus className="w-4 h-4" />
                {showChildForm ? "Hide" : "Add"} Child Information
              </button>
              {showChildForm && (
                <div className="space-y-4">
                  {children.map((child, i) => (
                    <div
                      key={i}
                      className="p-4 bg-muted/50 rounded-xl border border-border space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Child {i + 1}
                        </span>
                        {children.length > 1 && (
                          <button
                            onClick={() => removeChild(i)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="Child's name"
                        value={child.name}
                        onChange={(e) => updateChild(i, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Age"
                        type="number"
                        value={child.age}
                        onChange={(e) => updateChild(i, "age", e.target.value)}
                      />
                      <Input
                        placeholder="Health details (allergies, conditions...)"
                        value={child.healthDetails}
                        onChange={(e) => updateChild(i, "healthDetails", e.target.value)}
                      />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addChild} className="w-full">
                    <Plus className="w-4 h-4 mr-1" /> Add Another Child
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {isSignup
            ? "Already have an account? Switch to Login above."
            : "New to FamCare360? Switch to Sign Up above to get started."}
        </p>
      </div>
    </div>
  );
};

export default Login;
