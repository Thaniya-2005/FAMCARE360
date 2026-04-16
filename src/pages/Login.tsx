import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, User, Eye, EyeOff, Shield, Baby, ChevronRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ChildInfo {
  name: string;
  age: string;
  healthDetails: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [role, setRole] = useState<"parent" | "child">("parent");
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [children, setChildren] = useState<ChildInfo[]>([{ name: "", age: "", healthDetails: "" }]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup && role === "parent" && !fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    if (isSignup && password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isSignup && role === "parent") {
      // Save parent data
      const parentData = { fullName, email, children: children.filter(c => c.name.trim()) };
      localStorage.setItem("famcare360_parent_profile", JSON.stringify(parentData));
      localStorage.setItem("famcare360_auth", JSON.stringify({ role: "parent", email, fullName }));
      toast({ title: "Account created! 🎉", description: "Welcome to FamCare360" });
      navigate("/parent");
    } else {
      // Login
      localStorage.setItem("famcare360_auth", JSON.stringify({ role, email, fullName: role === "parent" ? fullName || email : email }));
      toast({ title: `Welcome back! 💚`, description: `Logged in as ${role}` });
      navigate(role === "parent" ? "/parent" : "/child");
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      setErrors({ email: "Enter your email to reset password" });
      return;
    }
    toast({ title: "Reset link sent 📧", description: `Check ${email} for reset instructions` });
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
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        {/* Logo & Welcome */}
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
            onClick={() => { setRole("parent"); setIsSignup(false); setErrors({}); setShowChildForm(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "parent"
                ? "gradient-parent text-white shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            Parent
          </button>
          <button
            onClick={() => { setRole("child"); setIsSignup(false); setErrors({}); setShowChildForm(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "child"
                ? "gradient-child text-white shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Baby className="w-4 h-4" />
            Child
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          {/* Login/Signup toggle for parent */}
          {role === "parent" && (
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button
                onClick={() => { setIsSignup(false); setErrors({}); setShowChildForm(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  !isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsSignup(true); setErrors({}); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  isSignup ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {role === "child" && (
            <div className="mb-5 p-3 rounded-xl bg-secondary/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                👋 Welcome! Log in to view your parent's health updates & daily tasks.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name — signup parent only */}
            {isSignup && role === "parent" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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

            {/* Confirm Password — signup only */}
            {isSignup && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Remember Me & Forgot */}
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
                <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:underline">
                  Forgot Password?
                </button>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className={`w-full h-12 text-base font-semibold rounded-xl shadow-card ${
              role === "parent" ? "gradient-parent" : "gradient-child"
            } text-white hover:opacity-90 transition-opacity`}>
              {isSignup ? "Create Account" : "Login"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Add Children Section — after signup toggle */}
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
                    <div key={i} className="p-4 bg-muted/50 rounded-xl border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">Child {i + 1}</span>
                        {children.length > 1 && (
                          <button onClick={() => removeChild(i)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <Input
                        placeholder="Child's name"
                        value={child.name}
                        onChange={e => updateChild(i, "name", e.target.value)}
                      />
                      <Input
                        placeholder="Age"
                        type="number"
                        value={child.age}
                        onChange={e => updateChild(i, "age", e.target.value)}
                      />
                      <Input
                        placeholder="Health details (allergies, conditions...)"
                        value={child.healthDetails}
                        onChange={e => updateChild(i, "healthDetails", e.target.value)}
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

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {role === "parent"
            ? isSignup
              ? "Already have an account? Switch to Login above."
              : "New here? Switch to Sign Up above to get started."
            : "Contact your parent to create an account for you."}
        </p>
      </div>
    </div>
  );
};

export default Login;
