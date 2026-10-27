"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ghost,
  LayoutDashboard,
  SearchCode,
  Cross,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Investigate",
    href: "/investigate",
    icon: SearchCode,
  },
  {
    name: "Dependency Graveyard",
    href: "/findings",
    icon: Ghost,
  },
  {
    name: "Reports Archive",
    href: "/reports",
    icon: FileSpreadsheet,
  },
  {
    name: "Settings & AI",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0b0c13] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 group-hover:border-purple-500/40 transition-all shadow-ghost">
            <Ghost className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
              Phantom
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MVP
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Dependency Examiner</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider uppercase text-slate-500">
          Investigation Deck
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-ghost"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-purple-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Hacktoberfest Badge */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="rounded-lg p-3 bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Hacktoberfest 2026</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Week 4: <em>Ghost in the Machine</em>. Local-first AI with Gemma 3 1B & Ollama.
          </p>
        </div>
      </div>
    </aside>
  );
}
