import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  variant?: "default" | "resting" | "aging" | "whispering" | "haunted";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: StatCardProps) {
  const variantStyles = {
    default: {
      border: "border-white/5",
      bg: "bg-[#0f1118]",
      iconBg: "bg-white/[0.04]",
      iconColor: "text-slate-400",
      glow: "",
    },
    resting: {
      border: "border-emerald-500/20",
      bg: "bg-emerald-950/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      glow: "hover:shadow-spectral",
    },
    aging: {
      border: "border-amber-500/20",
      bg: "bg-amber-950/10",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      glow: "hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.15)]",
    },
    whispering: {
      border: "border-purple-500/20",
      bg: "bg-purple-950/10",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      glow: "hover:shadow-ghost",
    },
    haunted: {
      border: "border-rose-500/25",
      bg: "bg-rose-950/10",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
      glow: "hover:shadow-haunted",
    },
  }[variant];

  return (
    <div
      className={cn(
        "p-5 rounded-xl border transition-all duration-300 relative overflow-hidden group",
        variantStyles.border,
        variantStyles.bg,
        variantStyles.glow
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
            variantStyles.iconBg,
            variantStyles.iconColor
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-3xl font-semibold text-slate-100 font-mono tracking-tight">
        {value}
      </div>
      <p className="mt-2 text-xs text-slate-400 leading-relaxed font-sans">{subtitle}</p>
    </div>
  );
}
