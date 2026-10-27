"use client";

import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { GraveyardStatus, FindingCategory } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: GraveyardStatus | "all";
  onStatusChange: (status: GraveyardStatus | "all") => void;
  categoryFilter: FindingCategory | "all";
  onCategoryChange: (cat: FindingCategory | "all") => void;
  sortBy: "severity" | "name" | "category";
  onSortChange: (sort: "severity" | "name" | "category") => void;
  counts: {
    all: number;
    resting: number;
    aging: number;
    whispering: number;
    haunted: number;
  };
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortBy,
  onSortChange,
  counts,
}: FilterBarProps) {
  const tabs: { id: GraveyardStatus | "all"; label: string; count: number; color: string }[] = [
    { id: "all", label: "All Spirits", count: counts.all, color: "text-slate-300" },
    { id: "resting", label: "Resting", count: counts.resting, color: "text-emerald-400" },
    { id: "aging", label: "Aging", count: counts.aging, color: "text-amber-400" },
    { id: "whispering", label: "Whispering", count: counts.whispering, color: "text-purple-400" },
    { id: "haunted", label: "Haunted", count: counts.haunted, color: "text-rose-400" },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search package name, title, or evidence..."
            className="w-full bg-[#0d0f17] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as any)}
            className="bg-[#0d0f17] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Categories</option>
            <option value="outdated">Outdated</option>
            <option value="inactive">Inactive</option>
            <option value="security">Security Advisory</option>
            <option value="unused">Possibly Unused</option>
            <option value="unresolved">Unresolved</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="bg-[#0d0f17] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-purple-500/50"
          >
            <option value="severity">Sort: Severity</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </div>

      {/* Graveyard Classification Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 whitespace-nowrap",
                isActive
                  ? "bg-purple-500/20 text-purple-200 border border-purple-500/40 shadow-ghost"
                  : "bg-white/[0.02] text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  isActive ? "bg-purple-500/30 text-purple-200" : "bg-white/5 text-slate-400"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
