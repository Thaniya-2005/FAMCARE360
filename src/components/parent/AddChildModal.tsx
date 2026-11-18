import React, { useState } from "react";
import { X, Baby, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChildAdded: () => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({
  isOpen,
  onClose,
  onChildAdded,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [healthDetails, setHealthDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { name?: string; age?: string } = {};
    if (!name.trim()) errs.name = "Child's name is required";
    if (age && (isNaN(Number(age)) || Number(age) < 0 || Number(age) > 18)) {
      errs.age = "Please enter a valid age between 0 and 18";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("children").insert({
        parent_id: user.id,
        name: name.trim(),
        age: age ? parseInt(age) : null,
        health_details: healthDetails.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Child Profile Added! 🌟",
        description: `${name.trim()} has been registered to your family circle.`,
      });

      setName("");
      setAge("");
      setHealthDetails("");
      onChildAdded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add child profile";
      toast({
        title: "Registration Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111A24] rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-[#E2EEF1] dark:border-[#1E2C3A] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#60738F] hover:text-[#102443] dark:hover:text-white p-1.5 rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Add Child
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Register a child to monitor their health records and care.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="child-name" className="text-sm font-bold text-[#102443] dark:text-white mb-1.5 block">
              Child's Full Name *
            </Label>
            <Input
              id="child-name"
              placeholder="e.g. Arjun, Aadhya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-[#E2EEF1] dark:border-[#1E2C3A]"
            />
            {errors.name && <p className="text-xs text-[#EF4444] mt-1 font-medium">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="child-age" className="text-sm font-bold text-[#102443] dark:text-white mb-1.5 block">
              Age (Years)
            </Label>
            <Input
              id="child-age"
              type="number"
              placeholder="e.g. 8"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="rounded-xl border-[#E2EEF1] dark:border-[#1E2C3A]"
            />
            {errors.age && <p className="text-xs text-[#EF4444] mt-1 font-medium">{errors.age}</p>}
          </div>

          <div>
            <Label htmlFor="health-details" className="text-sm font-bold text-[#102443] dark:text-white mb-1.5 block">
              Initial Health Notes / Allergies (Optional)
            </Label>
            <Textarea
              id="health-details"
              placeholder="e.g. Peanut allergy, Asthma, Normal activity..."
              value={healthDetails}
              onChange={(e) => setHealthDetails(e.target.value)}
              rows={3}
              className="rounded-xl border-[#E2EEF1] dark:border-[#1E2C3A] text-sm"
            />
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#159FA6] to-[#087B88] text-white shadow-md shadow-[#159FA6]/20 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChildModal;
