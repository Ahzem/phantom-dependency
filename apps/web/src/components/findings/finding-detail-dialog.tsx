"use client";

import React from "react";
import { Finding } from "@/types";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Terminal,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FindingDetailDialogProps {
  finding: Finding | null;
  onClose: () => void;
}

export function FindingDetailDialog({ finding, onClose }: FindingDetailDialogProps) {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-[#0e1018] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-lg font-semibold text-slate-100">
                {finding.package_name}
              </span>
              {finding.current_version && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/10">
                  v{finding.current_version}
                </span>
              )}
              {finding.target_version && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Latest: v{finding.target_version}
                </span>
              )}
            </div>
            <h2 className="text-sm font-medium text-slate-300">{finding.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status & Severity Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Graveyard Status</span>
              <p className="text-xs font-mono font-medium text-purple-300 uppercase mt-0.5">
                {finding.graveyard_status}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Category</span>
              <p className="text-xs font-mono font-medium text-slate-300 capitalize mt-0.5">
                {finding.category}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Severity</span>
              <p className="text-xs font-mono font-medium text-amber-400 uppercase mt-0.5">
                {finding.severity}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Verification</span>
              <p className="text-xs font-mono font-medium text-slate-300 mt-0.5">
                {finding.is_verified ? "Verified Fact" : "Heuristic"}
              </p>
            </div>
          </div>

          {/* AI Examination Block */}
          {finding.ai_explanation && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Local AI Examination (Gemma 3 1B)</span>
              </div>
              <p className="text-xs text-purple-100/90 leading-relaxed font-sans">
                {finding.ai_explanation}
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5" />
              Technical Finding
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
              {finding.explanation}
            </p>
          </div>

          {/* Supporting Evidence */}
          <div>
            <h3 className="text-xs font-mono uppercase text-slate-400 mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Supporting Evidence ({finding.evidence_source})
            </h3>
            <div className="space-y-1.5">
              {finding.evidence.map((ev, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-slate-300 flex items-start gap-2"
                >
                  <span className="text-purple-400 font-bold shrink-0">›</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Action */}
          <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/25 space-y-1.5">
            <h3 className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recommended Next Action
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              {finding.recommended_action}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            ID: {finding.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
