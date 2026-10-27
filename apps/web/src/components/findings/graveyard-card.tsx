"use client";

import React from "react";
import { Finding, GraveyardStatus } from "@/types";
import {
  AlertTriangle,
  Clock,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GraveyardCardProps {
  finding: Finding;
  onSelect: (finding: Finding) => void;
}

export function GraveyardCard({ finding, onSelect }: GraveyardCardProps) {
  const statusMeta: Record<
    GraveyardStatus,
    { label: string; badge: string; border: string; glow: string; icon: any }
  > = {
    resting: {
      label: "Resting",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      border: "border-emerald-500/15 hover:border-emerald-500/40",
      glow: "hover:shadow-spectral",
      icon: Clock,
    },
    aging: {
      label: "Aging",
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      border: "border-amber-500/15 hover:border-amber-500/40",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]",
      icon: Clock,
    },
    whispering: {
      label: "Whispering",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      border: "border-purple-500/15 hover:border-purple-500/40",
      glow: "hover:shadow-ghost",
      icon: HelpCircle,
    },
    haunted: {
      label: "Haunted",
      badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      border: "border-rose-500/20 hover:border-rose-500/50",
      glow: "hover:shadow-haunted",
      icon: ShieldAlert,
    },
  };

  const meta = statusMeta[finding.graveyard_status] || statusMeta.whispering;
  const StatusIcon = meta.icon;

  return (
    <div
      onClick={() => onSelect(finding)}
      className={cn(
        "p-4 rounded-xl border bg-[#0e1017] cursor-pointer transition-all duration-200 group flex flex-col justify-between",
        meta.border,
        meta.glow
      )}
    >
      <div>
        {/* Top bar: package name + status pill */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-slate-100 group-hover:text-purple-300 transition-colors text-sm">
              {finding.package_name}
            </span>
            {finding.current_version && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/5">
                v{finding.current_version}
              </span>
            )}
          </div>

          <span
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1",
              meta.badge
            )}
          >
            <StatusIcon className="w-3 h-3" />
            {meta.label}
          </span>
        </div>

        {/* Title & Explanation */}
        <h3 className="text-xs font-semibold text-slate-200 mb-1">{finding.title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {finding.explanation}
        </p>
      </div>

      {/* AI snippet if present */}
      {finding.ai_explanation && (
        <div className="p-2 rounded bg-purple-950/20 border border-purple-500/20 mb-3 text-[11px] text-purple-200/90 leading-tight flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">AI: {finding.ai_explanation}</span>
        </div>
      )}

      {/* Bottom metadata */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="truncate max-w-[180px]">{finding.evidence_source}</span>
        <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 text-xs">
          Details <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}
