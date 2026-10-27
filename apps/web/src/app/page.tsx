"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ghost,
  Boxes,
  Clock,
  ShieldAlert,
  HelpCircle,
  Search,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { fetchReports, fetchReportById } from "@/lib/api-client";
import { InvestigationReport, ReportListItem } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export default function OverviewPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [latestReport, setLatestReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchReports();
        setReports(list);
        if (list.length > 0) {
          const detailed = await fetchReportById(list[0].id);
          setLatestReport(detailed);
        }
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Ghost className="w-8 h-8 text-purple-400 animate-bounce" />
        <p className="text-sm font-mono text-slate-400">Summoning codebase spirits...</p>
      </div>
    );
  }

  // Empty state if no reports have been run
  if (!latestReport) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <div className="rounded-2xl overflow-hidden border border-purple-500/20 bg-[#0e1018] max-w-3xl mx-auto shadow-ghost">
          <div className="relative h-56 sm:h-72 w-full overflow-hidden border-b border-white/5">
            <img
              src="/ghost_banner.jpg"
              alt="Phantom Dependency: Ghost in the Machine"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1018] via-[#0e1018]/40 to-transparent" />
          </div>

          <div className="p-8 text-center space-y-5">
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-100">
                Every project has a past.
              </h1>
              <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                Discover forgotten, outdated, and concerning dependencies haunting your JavaScript and TypeScript codebases with local-first AI.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/investigate"
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono tracking-wide flex items-center gap-2 shadow-ghost transition-all hover:scale-105"
              >
                <Search className="w-4 h-4" />
                <span>Begin First Investigation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-6 rounded-xl bg-[#0e1018] border border-white/5 max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Quick Start Instructions
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Target a local project directory like <code className="text-purple-300">D:\Projects\WebApps\phantom-dependency\examples\sample-project</code>.
            Phantom Dependency will conservatively inspect manifests, lockfiles, and imports on-device without exposing code.
          </p>
        </div>
      </div>
    );
  }

  // Active overview with latest project data
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-100">
              Project: <span className="text-purple-300 font-mono">{latestReport.project_name}</span>
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
              Health: {latestReport.overall_health_score}/100
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono truncate max-w-xl">
            Path: {latestReport.project_path} • Inspected: {formatRelativeTime(latestReport.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/findings"
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View Graveyard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/investigate"
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white flex items-center gap-1.5 shadow-ghost transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Link>
        </div>
      </div>

      {/* AI Summary Banner */}
      {latestReport.ai_summary && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#10121c] to-purple-950/10 border border-purple-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Gemma 3 1B Ghost Examiner Summary</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Model: {latestReport.ai_model_used || "Local Ollama"}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {latestReport.ai_summary}
          </p>
        </div>
      )}

      {/* Census Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Direct Deps"
          value={latestReport.direct_dependencies}
          subtitle="Declared in manifest"
          icon={Boxes}
          variant="default"
        />
        <StatCard
          title="Resting"
          value={latestReport.graveyard_summary.resting}
          subtitle="Stable & referenced"
          icon={Clock}
          variant="resting"
        />
        <StatCard
          title="Aging"
          value={latestReport.graveyard_summary.aging}
          subtitle="Outdated / stale releases"
          icon={Clock}
          variant="aging"
        />
        <StatCard
          title="Whispering"
          value={latestReport.graveyard_summary.whispering}
          subtitle="Unreferenced or unknown"
          icon={HelpCircle}
          variant="whispering"
        />
        <StatCard
          title="Haunted"
          value={latestReport.graveyard_summary.haunted}
          subtitle="Security advisories"
          icon={ShieldAlert}
          variant="haunted"
        />
      </div>

      {/* Recent Investigations List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
            Investigation History
          </h2>
          <Link href="/reports" className="text-xs font-mono text-purple-400 hover:underline">
            View all ({reports.length})
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reports.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-white/5 bg-[#0e1018] space-y-2 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-slate-200">
                  {r.project_name}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    r.overall_health_score >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : r.overall_health_score >= 50
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  Score: {r.overall_health_score}/100
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate">{r.project_path}</p>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-white/5">
                <span>{r.findings_count} findings</span>
                <span>{formatRelativeTime(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
