import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidToken, setHasValidToken] = useState(true);

  useEffect(() => {
    // Check if recovery token exists in URL hash or session
    const hash = window.location.hash;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !hash.includes("access_token") && !hash.includes("type=recovery")) {
        setHasValidToken(false);
      }
    });
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!password) e.password = "New password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Password updated! ✅",
        description: "You can now log in with your new password.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update password.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
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
          <p className="text-muted-foreground text-sm">Reset your account password</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          {!hasValidToken ? (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-destructive font-medium">
                Invalid or expired reset link.
              </p>
              <p className="text-xs text-muted-foreground">
                Please return to the login page and request a new password reset link.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full mt-2 gradient-parent text-white font-semibold rounded-xl"
              >
                Go to Login
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary animate-bounce" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Password Reset Successfully!</h2>
              <p className="text-xs text-muted-foreground">
                Redirecting you to the login screen...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">New Password</Label>
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

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm New Password</Label>
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

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl shadow-card gradient-hero text-white hover:opacity-90 transition-opacity"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save New Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
