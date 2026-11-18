import React, { useState } from "react";
import { X, Heart, Activity, Scale, Smile, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { healthService } from "@/services/healthService";
import { useToast } from "@/hooks/use-toast";
import { getDefaultHealthData } from "@/types/health";

interface AddHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordAdded: () => void;
  childrenList: Array<{ id: string; name: string; linked_user_id?: string | null }>;
}

export const AddHealthRecordModal: React.FC<AddHealthRecordModalProps> = ({
  isOpen,
  onClose,
  onRecordAdded,
  childrenList,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"vitals" | "growth" | "mental">("vitals");
  const [selectedMember, setSelectedMember] = useState<string>("self");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vitals State
  const [heartRate, setHeartRate] = useState("76");
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [temperature, setTemperature] = useState("98.6");
  const [bloodSugar, setBloodSugar] = useState("95");
  const [oxygenSaturation, setOxygenSaturation] = useState("99");

  // Growth & BMI State
  const [height, setHeight] = useState("145"); // cm
  const [weight, setWeight] = useState("42"); // kg

  // Mental State
  const [moodScore, setMoodScore] = useState(4); // 1-5
  const [stressLevel, setStressLevel] = useState(2); // 1-5
  const [emotionalNotes, setEmotionalNotes] = useState("");

  if (!isOpen) return null;

  // Auto-calculated BMI
  const calculatedBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      return (w / (h * h)).toFixed(1);
    }
    return "0.0";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      let targetUserId = user.id;
      let targetChildLinkedId: string | null = null;
      if (selectedMember !== "self") {
        const selChild = childrenList.find((c) => c.id === selectedMember);
        if (selChild?.linked_user_id) {
          targetUserId = selChild.linked_user_id;
          targetChildLinkedId = selChild.linked_user_id;
        }
      }

      const today = new Date().toISOString().split("T")[0];

      // Prepare payload merging into daily report
      const baseReport = getDefaultHealthData();
      baseReport.date = today;
      baseReport.heartRate = parseInt(heartRate) || 76;
      baseReport.temperature = parseFloat(temperature) || 98.6;
      baseReport.bloodPressure = bloodPressure || "120/80";
      baseReport.bloodSugar = bloodSugar || "95";
      baseReport.moodScore = moodScore;
      baseReport.stressLevel = stressLevel;
      baseReport.emotionalNotes = emotionalNotes;

      // Persist health report
      const reportRes = await healthService.saveHealthReport(targetUserId, baseReport);
      if (!reportRes.success && reportRes.error) {
        throw new Error(reportRes.error);
      }

      // Save granular vital sign records if filled
      if (heartRate) {
        await healthService.saveVitalSign(targetUserId, "heart_rate", parseFloat(heartRate), "bpm");
      }
      if (temperature) {
        await healthService.saveVitalSign(targetUserId, "temperature", parseFloat(temperature), "°F");
      }
      if (bloodSugar) {
        await healthService.saveVitalSign(targetUserId, "blood_sugar", parseFloat(bloodSugar), "mg/dL");
      }
      if (oxygenSaturation) {
        await healthService.saveVitalSign(targetUserId, "oxygen_saturation", parseFloat(oxygenSaturation), "%");
      }

      // If updating a child's record, notify the child
      if (targetChildLinkedId) {
        await healthService.notifyChildOfHealthRecord(targetChildLinkedId, activeTab);
      }

      toast({
        title: "Health Record Saved! 💚",
        description: "New clinical and wellness data has been recorded.",
      });

      onRecordAdded();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record health measurement";
      toast({
        title: "Record Save Error",
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
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#102443] dark:text-white tracking-tight">
              Add Health Record
            </h3>
            <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
              Log clinical vital signs, growth stats or wellness observations.
            </p>
          </div>
        </div>

        {/* Member selector */}
        <div className="mb-4">
          <Label className="text-xs font-bold text-[#60738F] dark:text-[#A0B0C0] uppercase tracking-wider mb-1.5 block">
            Target Family Member
          </Label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-[#E2EEF1] dark:border-[#1E2C3A] bg-white dark:bg-[#182330] text-sm font-semibold text-[#102443] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#159FA6]"
          >
            <option value="self">You (Primary Parent)</option>
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Child)
              </option>
            ))}
          </select>
        </div>

        {/* Category Tab Selector */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] border border-[#E2EEF1] dark:border-[#1E2C3A] mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("vitals")}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "vitals"
                ? "bg-white dark:bg-[#111A24] text-[#159FA6] shadow-sm"
                : "text-[#60738F] hover:text-[#102443]"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vital Signs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("growth")}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "growth"
                ? "bg-white dark:bg-[#111A24] text-[#159FA6] shadow-sm"
                : "text-[#60738F] hover:text-[#102443]"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Growth & BMI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mental")}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "mental"
                ? "bg-white dark:bg-[#111A24] text-[#159FA6] shadow-sm"
                : "text-[#60738F] hover:text-[#102443]"
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Wellness</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === "vitals" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Heart Rate (bpm)
                  </Label>
                  <Input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="76"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Blood Pressure
                  </Label>
                  <Input
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Temp (°F)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Sugar (mg/dL)
                  </Label>
                  <Input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="95"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    SpO2 (%)
                  </Label>
                  <Input
                    type="number"
                    value={oxygenSaturation}
                    onChange={(e) => setOxygenSaturation(e.target.value)}
                    placeholder="99"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "growth" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Height (cm)
                  </Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="145"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                    Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="42"
                    className="rounded-xl border-[#E2EEF1]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/10 border border-[#159FA6]/20 text-center">
                <span className="text-xs font-bold text-[#159FA6] uppercase tracking-wider block">
                  Computed BMI Index
                </span>
                <span className="text-3xl font-black text-[#102443] dark:text-white">
                  {calculatedBMI()}
                </span>
                <span className="text-xs text-[#60738F] block mt-0.5">Normal weight category</span>
              </div>
            </div>
          )}

          {activeTab === "mental" && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold text-[#102443] dark:text-white">
                    Mood Rating (1 = Low, 5 = Happy)
                  </Label>
                  <span className="text-xs font-bold text-[#159FA6]">{moodScore}/5</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[moodScore]}
                  onValueChange={([v]) => setMoodScore(v)}
                  className="py-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-bold text-[#102443] dark:text-white">
                    Stress Level (1 = Calm, 5 = High)
                  </Label>
                  <span className="text-xs font-bold text-[#159FA6]">{stressLevel}/5</span>
                </div>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[stressLevel]}
                  onValueChange={([v]) => setStressLevel(v)}
                  className="py-2"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-[#102443] dark:text-white mb-1 block">
                  Emotional Notes / Reflections
                </Label>
                <Textarea
                  value={emotionalNotes}
                  onChange={(e) => setEmotionalNotes(e.target.value)}
                  placeholder="Notes on energy, feelings, or behavioral changes..."
                  rows={2}
                  className="rounded-xl border-[#E2EEF1] text-sm"
                />
              </div>
            </div>
          )}

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
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHealthRecordModal;
