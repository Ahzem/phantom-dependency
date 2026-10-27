"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Terminal,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import { fetchAIStatus } from "@/lib/api-client";
import { AIStatusResponse } from "@/types";

export default function SettingsPage() {
  const [status, setStatus] = useState<AIStatusResponse | null>(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetchAIStatus();
      setStatus(res);
    } catch (err: any) {
      setStatus({
        is_available: false,
        model_present: false,
        installed_models: [],
        target_model: "gemma3:1b",
        message: err.message || "Failed to reach backend",
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Settings & Local AI Environment
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect and configure local inference with Ollama and Gemma 3 1B.
        </p>
      </div>

      {/* Ollama Status Section */}
      <div className="p-6 rounded-2xl bg-[#0e1018] border border-white/5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-purple-400" />
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Ollama Local Inference</h2>
              <p className="text-xs text-slate-400">Endpoint: http://127.0.0.1:11434</p>
            </div>
          </div>

          <button
            onClick={testConnection}
            disabled={testing}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors border border-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>
        </div>

        {/* Status result card */}
        {status && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-mono ${
              status.is_available && status.model_present
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : status.is_available
                ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
                : "bg-rose-950/20 border-rose-500/30 text-rose-300"
            }`}
          >
            {status.is_available && status.model_present ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">{status.message}</p>
              {status.installed_models.length > 0 && (
                <p className="text-[11px] opacity-80">
                  Installed models: {status.installed_models.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Setup guide */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Setup Commands</span>
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-400">
            <div className="p-2 rounded bg-black/60 border border-white/5 text-purple-300 flex items-center justify-between">
              <code>ollama pull gemma3:1b</code>
              <span className="text-[10px] text-slate-500">Fast 1B model</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Phantom Dependency communicates exclusively with your local Ollama port. No cloud keys, accounts, or credits required.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy & Security Architecture */}
      <div className="p-6 rounded-2xl bg-[#0e1018] border border-white/5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-100">Privacy & Architecture Guarantees</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Source Code Transmission</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Source files are statically inspected on your machine only. File contents, functions, and logic are never uploaded to any remote server or AI API.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Opt-in Network Enrichment</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Registry and OSV advisory lookups are strictly opt-in. When enabled, only package names and version strings are queried.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Safe Filesystem Access</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Path safety checks reject traversal and ignore credentials, private keys, <code className="text-purple-300">.env</code> files, and symlink junctions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Grounded AI Explanations</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Gemma 3 1B explanations are grounded strictly in discovered evidence. Hallucinations are rejected and deterministic fallbacks ensure stability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
