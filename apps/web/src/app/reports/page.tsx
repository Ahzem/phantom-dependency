"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Ghost,
} from "lucide-react";
import { fetchReports, getExportUrl } from "@/lib/api-client";
import { ReportListItem } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchReports();
        setReports(list);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            Investigation Reports Archive
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical investigation artifacts saved locally. Export reports to Markdown or JSON anytime.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Ghost className="w-6 h-6 text-purple-400 animate-pulse" />
          <p className="text-xs font-mono text-slate-400">Loading archives...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0e1018] border border-white/5 text-center space-y-3">
          <Ghost className="w-10 h-10 text-slate-600 mx-auto" />
          <h2 className="text-sm font-mono text-slate-300">No Reports Archived Yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Run an investigation on a local project to compile and save your first dependency graveyard report.
          </p>
          <Link
            href="/investigate"
            className="inline-block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white shadow-ghost transition-all"
          >
            Investigate a Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl bg-[#0e1018] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-semibold text-slate-100">
                    {report.project_name}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      report.overall_health_score >= 80
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : report.overall_health_score >= 50
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    Health: {report.overall_health_score}/100
                  </span>
                  {report.haunted_count > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      {report.haunted_count} Haunted
                    </span>
                  )}
                </div>

                <p className="text-xs font-mono text-slate-500 truncate max-w-md">
                  {report.project_path}
                </p>

                <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {formatRelativeTime(report.created_at)}
                  </span>
                  <span>{report.total_dependencies} packages</span>
                  <span>{report.findings_count} findings</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <a
                  href={getExportUrl(report.id, "markdown")}
                  download
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
                  title="Download Markdown"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>MD</span>
                </a>
                <a
                  href={getExportUrl(report.id, "json")}
                  download
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 flex items-center gap-1 transition-colors"
                  title="Download JSON"
                >
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>JSON</span>
                </a>
                <Link
                  href={`/findings?report_id=${report.id}`}
                  className="px-4 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-mono flex items-center gap-1 transition-all"
                >
                  <span>Open Report</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
