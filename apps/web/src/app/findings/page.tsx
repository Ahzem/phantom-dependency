"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Ghost,
  Download,
  Share2,
  FileText,
  FileCode,
  Sparkles,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  Clock,
  Search,
} from "lucide-react";
import { fetchReports, fetchReportById, getExportUrl } from "@/lib/api-client";
import { InvestigationReport, Finding, GraveyardStatus, FindingCategory } from "@/types";
import { GraveyardCard } from "@/components/findings/graveyard-card";
import { FindingDetailDialog } from "@/components/findings/finding-detail-dialog";
import { FilterBar } from "@/components/findings/filter-bar";
import Link from "next/link";

function FindingsContent() {
  const searchParams = useSearchParams();
  const queryReportId = searchParams.get("report_id");

  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GraveyardStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<FindingCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"severity" | "name" | "category">("severity");

  // Selected finding modal
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (queryReportId) {
          const rep = await fetchReportById(queryReportId);
          setReport(rep);
        } else {
          const list = await fetchReports();
          if (list.length > 0) {
            const rep = await fetchReportById(list[0].id);
            setReport(rep);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load findings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [queryReportId]);

  // Filter and sort findings
  const filteredFindings = useMemo(() => {
    if (!report) return [];

    let list = [...report.findings];

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((f) => f.graveyard_status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      list = list.filter((f) => f.category === categoryFilter);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.package_name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.explanation.toLowerCase().includes(q) ||
          f.evidence.some((ev) => ev.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "severity") {
        const order: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
          info: 0,
        };
        return (order[b.severity] ?? 0) - (order[a.severity] ?? 0);
      } else if (sortBy === "name") {
        return a.package_name.localeCompare(b.package_name);
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    return list;
  }, [report, statusFilter, categoryFilter, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Ghost className="w-8 h-8 text-purple-400 animate-bounce" />
        <p className="text-sm font-mono text-slate-400">Loading graveyard report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-16 space-y-4">
        <Ghost className="w-10 h-10 text-slate-600 mx-auto" />
        <h2 className="text-sm font-mono text-slate-300">No Graveyard Report Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error || "Run an investigation first to populate the dependency graveyard."}
        </p>
        <Link
          href="/investigate"
          className="inline-block px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-mono text-white shadow-ghost transition-all"
        >
          Investigate a Project
        </Link>
      </div>
    );
  }

  const counts = {
    all: report.findings.length,
    resting: report.graveyard_summary.resting,
    aging: report.graveyard_summary.aging,
    whispering: report.graveyard_summary.whispering,
    haunted: report.graveyard_summary.haunted,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <Ghost className="w-5 h-5 text-purple-400" />
              Dependency Graveyard: {report.project_name}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Target: {report.project_path} • Total direct: {report.total_dependencies} packages
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={getExportUrl(report.id, "markdown")}
            download
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Markdown</span>
          </a>
          <a
            href={getExportUrl(report.id, "json")}
            download
            className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </a>
        </div>
      </div>

      {/* AI Summary Card */}
      {report.ai_summary && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
              Gemma 3 1B AI Examination
            </span>
            <p className="text-xs text-purple-200/90 leading-relaxed font-sans">
              {report.ai_summary}
            </p>
          </div>
        </div>
      )}

      {/* Filters and search */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />

      {/* Findings Grid */}
      {filteredFindings.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#0e1018] border border-white/5 text-center space-y-2">
          <Ghost className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-mono text-slate-400">No matching spirits found in graveyard</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="text-xs font-mono text-purple-400 hover:underline"
          >
            Clear active filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFindings.map((f) => (
            <GraveyardCard
              key={f.id}
              finding={f}
              onSelect={(finding) => setSelectedFinding(finding)}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <FindingDetailDialog
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Ghost className="w-8 h-8 text-purple-400 animate-bounce" />
          <p className="text-sm font-mono text-slate-400">Loading graveyard...</p>
        </div>
      }
    >
      <FindingsContent />
    </Suspense>
  );
}
