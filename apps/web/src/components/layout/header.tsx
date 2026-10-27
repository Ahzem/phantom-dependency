"use client";

import { useEffect, useState } from "react";
import { fetchAIStatus } from "@/lib/api-client";
import { AIStatusResponse } from "@/types";
import { Cpu, Terminal, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";

export function Header() {
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetchAIStatus();
        if (mounted) setAiStatus(res);
      } catch (err) {
        if (mounted) {
          setAiStatus({
            is_available: false,
            model_present: false,
            installed_models: [],
            target_model: "gemma3:1b",
            message: "Ollama server offline or unreachable",
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-14 border-b border-white/5 bg-[#0b0c13]/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-400">
          Target Environment: <span className="text-slate-200">Local Machine (Windows 11)</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Ollama Status Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all hover:border-white/20 bg-black/40"
        >
          <div
            className={`w-2 h-2 rounded-full ${
              aiStatus?.is_available && aiStatus?.model_present
                ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                : aiStatus?.is_available
                ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                : "bg-rose-400 shadow-[0_0_8px_#f43f5e]"
            }`}
          />
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-300">
            {loading
              ? "Checking Ollama..."
              : aiStatus?.is_available && aiStatus?.model_present
              ? "gemma3:1b Active"
              : aiStatus?.is_available
              ? "Model Missing"
              : "Ollama Offline"}
          </span>
        </Link>

        {/* Privacy shield badge */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local-Only Scan</span>
        </div>
      </div>
    </header>
  );
}
