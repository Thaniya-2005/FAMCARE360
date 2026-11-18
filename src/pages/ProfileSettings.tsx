import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Phone, Save, Plus, Trash2, Heart, Loader2, LogOut,
  Baby, Settings, Users, Copy, Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ChildRecord {
  id?: string;
  name: string;
  age: number | null;
  health_details: string | null;
  isNew?: boolean;
}

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, family, signOut, refreshProfile, refreshFamily } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadChildren = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", userId)
        .order("created_at");

      if (!error && data) {
        setChildren(
          data.map((c) => ({
            id: c.id,
            name: c.name,
            age: c.age,
            health_details: c.health_details,
          }))
        );
      }
    } catch (err) {
      console.warn("Could not load children records:", err);
    } finally {
      setLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
    loadChildren(user.id);
  }, [user, profile, navigate, loadChildren]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim() })
        .eq("user_id", user.id);

      if (error) {
        // If profile row doesn't exist yet, insert it
        await supabase.from("profiles").upsert({
          user_id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: profile?.role || "parent",
        });
      }

      // Handle children
      for (const child of children) {
        if (child.isNew && child.name.trim()) {
          await supabase.from("children").insert({
            parent_id: user.id,
            family_id: family?.id || null,
            name: child.name.trim(),
            age: child.age,
            health_details: child.health_details?.trim() || null,
          });
        } else if (child.id) {
          await supabase
            .from("children")
            .update({
              name: child.name.trim(),
              age: child.age,
              health_details: child.health_details?.trim() || null,
            })
            .eq("id", child.id);
        }
      }

      await refreshProfile();
      await refreshFamily();
      await loadChildren(user.id);

      toast({
        title: "Profile updated! ✅",
        description: "Your changes have been saved successfully.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error saving profile.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    setChildren([...children, { name: "", age: null, health_details: null, isNew: true }]);
  };

  const removeChild = async (index: number) => {
    const child = children[index];
    if (child.id) {
      try {
        await supabase.from("children").delete().eq("id", child.id);
      } catch (err) {
        console.warn("Could not delete child remotely:", err);
      }
    }
    setChildren(children.filter((_, i) => i !== index));
    toast({ title: "Child removed", description: "Record deleted successfully." });
  };

  const updateChild = (i: number, field: keyof ChildRecord, value: string | number | null) => {
    const updated = [...children];
    updated[i] = { ...updated[i], [field]: value };
    setChildren(updated);
  };

  const handleCopyInviteCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code);
      setCopiedCode(true);
      toast({
        title: "Invite Code Copied! 📋",
        description: `Code ${family.invite_code} copied to clipboard. Share it with your child.`,
      });
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Profile Settings</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 gradient-hero rounded-full flex items-center justify-center shadow-card">
            <span className="text-3xl">👤</span>
          </div>
          <div className="text-center">
            <p className="font-bold text-foreground text-lg">{fullName || "Your Name"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
              <Heart className="w-3 h-3" /> {profile?.role || "parent"}
            </span>
          </div>
        </div>

        {/* Family Connection Information */}
        {family && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" /> Family Circle
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                {family.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Share your Family Invite Code with your child so they can link to your health dashboard when creating their account.
            </p>
            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3 border border-border">
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Invite Code
                </div>
                <div className="text-base font-mono font-bold text-foreground tracking-wider">
                  {family.invite_code}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyInviteCode}
                className="gap-1.5"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Personal Information
          </h2>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">Email (read-only)</Label>
            <Input value={user.email || ""} disabled className="opacity-60" />
          </div>
        </div>

        {/* Children Management — Parents only */}
        {profile?.role === "parent" && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Baby className="w-5 h-5 text-accent" /> Manage Children
              </h2>
              <Button variant="outline" size="sm" onClick={addChild}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {loadingChildren ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : children.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No children added yet. Click &quot;Add&quot; to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {children.map((child, i) => (
                  <div
                    key={child.id || `new-${i}`}
                    className="p-4 bg-muted/50 rounded-xl border border-border space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <span className="text-lg">👦</span> Child {i + 1}
                        {child.isNew && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => removeChild(i)}
                        className="text-destructive hover:text-destructive/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <Input
                      placeholder="Child's name"
                      value={child.name}
                      onChange={(e) => updateChild(i, "name", e.target.value)}
                    />
                    <Input
                      placeholder="Age"
                      type="number"
                      value={child.age ?? ""}
                      onChange={(e) =>
                        updateChild(i, "age", e.target.value ? parseInt(e.target.value) : null)
                      }
                    />
                    <Input
                      placeholder="Health details (allergies, conditions...)"
                      value={child.health_details || ""}
                      onChange={(e) => updateChild(i, "health_details", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full h-12 text-base font-semibold rounded-xl gradient-hero text-white shadow-card hover:opacity-90 transition-opacity"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </>
          )}
        </Button>
      </main>
    </div>
  );
};

export default ProfileSettings;
