"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Globe,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Loader2,
  Shield,
  FileCode2,
} from "lucide-react";
import { validateProject, runInvestigation } from "@/lib/api-client";
import { ProjectValidateResponse, InvestigationReport } from "@/types";

const STEPS = [
  { id: 1, label: "Select Project" },
  { id: 2, label: "Manifest & Lockfile Scan" },
  { id: 3, label: "Source Reference Inspection" },
  { id: 4, label: "Evidence & Graveyard Mapping" },
  { id: 5, label: "Gemma 3 1B AI Examination" },
];

export default function InvestigatePage() {
  const router = useRouter();

  const [projectPath, setProjectPath] = useState<string>(
    "D:\\Projects\\WebApps\\phantom-dependency\\examples\\sample-project"
  );
  const [enableEnrichment, setEnableEnrichment] = useState<boolean>(false);
  const [enableAI, setEnableAI] = useState<boolean>(true);

  const [validating, setValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ProjectValidateResponse | null>(null);

  const [scanning, setScanning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!projectPath.trim()) return;
    setValidating(true);
    setValidationResult(null);
    setScanError(null);
    try {
      const res = await validateProject(projectPath);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        is_valid: false,
        project_path: projectPath,
        has_lockfile: false,
        error: err.message || "Failed to connect to backend",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleStartInvestigation = async () => {
    if (!projectPath.trim()) return;
    setScanning(true);
    setScanError(null);
    setCurrentStep(2);

    try {
      // Simulate stepper progress for UX feedback
      const stepTimer1 = setTimeout(() => setCurrentStep(3), 600);
      const stepTimer2 = setTimeout(() => setCurrentStep(4), 1200);
      const stepTimer3 = setTimeout(() => setCurrentStep(5), 1800);

      const report = await runInvestigation({
        project_path: projectPath,
        enable_enrichment: enableEnrichment,
        enable_ai: enableAI,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      // Successfully generated report, navigate to findings
      router.push(`/findings?report_id=${report.id}`);
    } catch (err: any) {
      setScanError(err.message || "An error occurred during investigation");
      setCurrentStep(1);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-400" />
          Investigate Project
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select a local JavaScript or TypeScript project to investigate for ghosts, outdated residents, and security hazards.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="p-4 rounded-xl bg-[#0e1018] border border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Investigation Pipeline</span>
          <span className="text-purple-400">Step {currentStep} of {STEPS.length}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id <= currentStep ? "bg-purple-500 shadow-ghost" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] font-mono text-slate-500">
          Current phase: <span className="text-slate-300">{STEPS[currentStep - 1].label}</span>
        </p>
      </div>

      {/* Main Input Card */}
      <div className="p-6 rounded-2xl bg-[#0e1018] border border-white/5 space-y-6">
        {/* Project Path Field */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-300 flex items-center justify-between">
            <span>Local Project Directory Path</span>
            <span className="text-[10px] text-slate-500 lowercase">Windows 11 Path</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              disabled={scanning}
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="e.g. D:\Projects\WebApps\my-react-app"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500/50"
            />
            <button
              onClick={handleValidate}
              disabled={validating || scanning}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderOpen className="w-3.5 h-3.5" />}
              <span>Validate</span>
            </button>
          </div>

          {/* Quick preset button */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500">Try sample testbed:</span>
            <button
              type="button"
              onClick={() => {
                setProjectPath("D:\\Projects\\WebApps\\phantom-dependency\\examples\\sample-project");
                setValidationResult(null);
              }}
              className="text-[11px] font-mono text-purple-400 hover:text-purple-300 underline"
            >
              examples\sample-project
            </button>
          </div>
        </div>

        {/* Validation Result Badge */}
        {validationResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono flex items-start gap-3 ${
              validationResult.is_valid
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                : "bg-rose-950/20 border-rose-500/30 text-rose-300"
            }`}
          >
            {validationResult.is_valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="font-semibold">
                {validationResult.is_valid
                  ? `Valid manifest detected: ${validationResult.project_name || "Project"}`
                  : "Invalid project path"}
              </p>
              {validationResult.is_valid ? (
                <p className="text-[11px] opacity-80">
                  Lockfile: {validationResult.has_lockfile ? `${validationResult.lockfile_type} lockfile found` : "No lockfile detected (will use range estimates)"}
                </p>
              ) : (
                <p className="text-[11px] opacity-80">{validationResult.error}</p>
              )}
            </div>
          </div>
        )}

        {/* Investigation Configuration Options */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h2 className="text-xs font-mono uppercase text-slate-400">Options & Disclosures</h2>

          {/* AI Toggle */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-medium text-slate-200">
                  Local AI Ghost Examination (Ollama & Gemma 3 1B)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Uses your locally running Ollama instance to generate beginner-friendly explanations.
                If Ollama is offline, deterministic heuristic templates are seamlessly substituted.
              </p>
            </div>
          </label>

          {/* Network Enrichment Toggle */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
            <input
              type="checkbox"
              checked={enableEnrichment}
              onChange={(e) => setEnableEnrichment(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-200">
                  Enable Network Enrichment (npm Registry & OSV.dev)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Opt-in
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Queries npm registry for latest versions and OSV.dev for real-time security advisories.
                Only package names and version strings are transmitted; source code never leaves your computer.
              </p>
            </div>
          </label>
        </div>

        {/* Error message */}
        {scanError && (
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleStartInvestigation}
            disabled={scanning}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-ghost transition-all disabled:opacity-50"
          >
            {scanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exorcising Codebase Spirits...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Launch Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
