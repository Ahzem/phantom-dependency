import {
  AIStatusResponse,
  InvestigationReport,
  ProjectValidateResponse,
  ReportListItem,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API health check failed");
  return res.json();
}

export async function fetchAIStatus(): Promise<AIStatusResponse> {
  const res = await fetch(`${API_BASE}/ai/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch AI status");
  return res.json();
}

export async function validateProject(projectPath: string): Promise<ProjectValidateResponse> {
  const res = await fetch(`${API_BASE}/projects/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_path: projectPath }),
  });
  return res.json();
}

export async function runInvestigation(params: {
  project_path: string;
  enable_enrichment: boolean;
  enable_ai: boolean;
}): Promise<InvestigationReport> {
  const res = await fetch(`${API_BASE}/analysis/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Scan failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchReports(): Promise<ReportListItem[]> {
  const res = await fetch(`${API_BASE}/reports`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch reports");
  return res.json();
}

export async function fetchReportById(reportId: string): Promise<InvestigationReport> {
  const res = await fetch(`${API_BASE}/reports/${reportId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export function getExportUrl(reportId: string, format: "markdown" | "json"): string {
  return `${API_BASE}/reports/${reportId}/export?format=${format}`;
}
