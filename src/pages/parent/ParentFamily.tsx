import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserPlus, Share2, Copy, Check, ChevronRight, Heart,
  Calendar, Bell, QrCode, Crown, User
} from "lucide-react";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { AddChildModal } from "@/components/parent/AddChildModal";
import { InviteFamilyModal } from "@/components/parent/InviteFamilyModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChildRecord {
  id: string;
  name: string;
  age: number | null;
  health_details: string | null;
}

export const ParentFamily: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, family } = useAuth();
  const { toast } = useToast();

  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const inviteCode = family?.invite_code || "FAM3607A";

  const loadChildren = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id);
      if (data) {
        setChildren(data as ChildRecord[]);
      }
    } catch {
      // Graceful fallback
    }
  }, [user]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast({
        title: "Code Copied! 📋",
        description: `Family invite code ${inviteCode} copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const totalMembers = 1 + children.length;

  return (
    <ParentLayout title="My Family">
      <div className="space-y-5 max-w-4xl mx-auto">
        {/* =========================================================================
            1. HERO BANNER matching Reference 2
        ========================================================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#159FA6] via-[#1FAFB6] to-[#42C5C9] p-6 sm:p-7 text-white shadow-lg shadow-[#159FA6]/20">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
              My Family
            </h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Manage your family members, profiles and access.
            </p>
          </div>

          <div className="absolute right-4 -bottom-4 opacity-25 sm:opacity-35 pointer-events-none">
            <svg width="180" height="150" viewBox="0 0 200 160" fill="none">
              <path
                d="M100 140c-60-40-90-80-90-110 0-25 20-30 40-30 20 0 35 15 50 30 15-15 30-30 50-30 20 0 40 5 40 30 0 30-30 70-90 110z"
                fill="white"
              />
              <circle cx="90" cy="65" r="14" fill="#087B88" />
              <path d="M70 100c0-15 10-25 25-25s25 10 25 25" fill="#087B88" />
              <circle cx="125" cy="75" r="10" fill="#087B88" />
            </svg>
          </div>
        </div>

        {/* =========================================================================
            2. FAMILY OVERVIEW CARD matching Reference 2
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-[#102443] dark:text-white text-base tracking-tight">
                  Family Overview
                </h3>
                <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                  Your family at a glance
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] text-xs font-bold">
              {totalMembers} Members
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2 border-t border-[#E2EEF1] dark:border-[#1E2C3A]">
            <div>
              <Heart className="w-5 h-5 text-[#159FA6] mx-auto mb-1" />
              <div className="text-lg font-black text-[#102443] dark:text-white">82%</div>
              <div className="text-[11px] font-medium text-[#60738F] dark:text-[#A0B0C0]">
                Family Health
              </div>
            </div>
            <div className="border-x border-[#E2EEF1] dark:border-[#1E2C3A]">
              <Calendar className="w-5 h-5 text-[#159FA6] mx-auto mb-1" />
              <div className="text-lg font-black text-[#102443] dark:text-white">1</div>
              <div className="text-[11px] font-medium text-[#60738F] dark:text-[#A0B0C0]">
                Upcoming
              </div>
            </div>
            <div>
              <Bell className="w-5 h-5 text-[#EF4444] mx-auto mb-1" />
              <div className="text-lg font-black text-[#102443] dark:text-white">0</div>
              <div className="text-[11px] font-medium text-[#60738F] dark:text-[#A0B0C0]">
                Active Alerts
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. FAMILY MEMBERS LIST matching Reference 2
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 sm:p-6 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-[#102443] dark:text-white tracking-tight">
              Family Members
            </h4>
            <button
              onClick={() => navigate("/parent/more")}
              className="text-xs font-bold text-[#159FA6] hover:underline flex items-center gap-0.5"
            >
              <span>Manage Access</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Primary Parent Card matching Reference 2 */}
            <div
              onClick={() => navigate("/parent/more")}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] hover:bg-[#EBF5F8] dark:hover:bg-[#1F2F40] border border-[#E2EEF1] dark:border-[#223344] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#159FA6] to-[#42C5C9] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#102443] dark:text-white">
                      {profile?.full_name || "You (Parent)"}
                    </span>
                    <Crown className="w-3.5 h-3.5 fill-[#F3A623] text-[#F3A623]" />
                  </div>
                  <span className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                    Primary Account
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] text-xs font-bold">
                  Adult
                </span>
                <ChevronRight className="w-4 h-4 text-[#60738F]" />
              </div>
            </div>

            {/* Child Member Cards matching Reference 2 */}
            {children.map((child, idx) => {
              const statusDot = idx === 0 ? "bg-[#22B96B]" : "bg-[#F3A623]";
              const statusText = idx === 0 ? "Healthy" : "Needs Attention";

              return (
                <div
                  key={child.id}
                  onClick={() => navigate(`/parent/member/${child.id}`)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4FAFC] dark:bg-[#182330] hover:bg-[#EBF5F8] dark:hover:bg-[#1F2F40] border border-[#E2EEF1] dark:border-[#223344] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E6F8F7] to-[#BEEBEA] text-[#159FA6] dark:bg-teal-950/40 flex items-center justify-center font-bold text-base border border-[#159FA6]/30">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#102443] dark:text-white">
                        {child.name}
                      </div>
                      <span className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                        Age: {child.age || "N/A"} • Child Account
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#102443] dark:text-white">
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                      <span>{statusText}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#60738F]" />
                  </div>
                </div>
              );
            })}

            {children.length === 0 && (
              <div className="text-center py-6 border border-dashed border-[#E2EEF1] dark:border-[#1E2C3A] rounded-2xl p-4">
                <Users className="w-8 h-8 text-[#90A4AE] mx-auto mb-2 opacity-60" />
                <p className="text-xs font-semibold text-[#60738F] dark:text-[#A0B0C0]">
                  No child accounts linked yet. Click below to register a child.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            4. ACTION BUTTONS: Add Child & Invite to Family matching Reference 2
        ========================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Add Child Pill Button */}
          <button
            onClick={() => setIsAddChildOpen(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 hover:bg-[#D4F4F2] text-[#159FA6] dark:text-[#42C5C9] font-bold text-sm border border-[#159FA6]/30 shadow-sm transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Child</span>
          </button>

          {/* Invite to Family Pill Button */}
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#F5F3FF] dark:bg-purple-950/20 hover:bg-[#EDE9FE] text-[#9333EA] dark:text-[#C084FC] font-bold text-sm border border-[#EDE9FE] dark:border-purple-900/30 shadow-sm transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Invite to Family</span>
          </button>
        </div>

        {/* =========================================================================
            5. FAMILY CODE CARD matching Reference 2
        ========================================================================== */}
        <div className="bg-white dark:bg-[#111A24] rounded-3xl p-5 border border-[#E2EEF1] dark:border-[#1E2C3A] shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#102443] dark:text-white">
                  Family Code
                </h4>
                <p className="text-xs text-[#60738F] dark:text-[#A0B0C0]">
                  Share this code to let a child join your family.
                </p>
              </div>
            </div>

            {/* Copyable Family Code Pill */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E6F8F7] dark:bg-[#159FA6]/20 text-[#159FA6] dark:text-[#42C5C9] font-mono font-bold text-xs border border-[#159FA6]/30 hover:bg-[#D4F4F2] transition-colors"
              title="Copy family invite code"
            >
              <span>{inviteCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-[#22B96B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Supporting Modals */}
      <AddChildModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        onChildAdded={loadChildren}
      />

      <InviteFamilyModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </ParentLayout>
  );
};

export default ParentFamily;
