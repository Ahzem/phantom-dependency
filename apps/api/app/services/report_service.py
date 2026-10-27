from typing import Dict, Any
from app.schemas.report import InvestigationReport


class ReportService:
    @staticmethod
    def generate_markdown_report(report: InvestigationReport) -> str:
        lines = [
            f"# 👻 Phantom Dependency Investigation Report: {report.project_name}",
            "",
            f"> *Every project has a past. Discover the dependencies haunting yours.*",
            "",
            "## 📊 Executive Summary",
            f"- **Target Project:** `{report.project_path}`",
            f"- **Analysis Date:** `{report.created_at}`",
            f"- **Tool Version:** `Phantom Dependency v{report.tool_version}`",
            f"- **Overall Health Score:** **{report.overall_health_score}/100**",
            f"- **Total Direct Dependencies:** {report.total_dependencies}",
            "",
            "### ⚰️ Dependency Graveyard Census",
            f"- 🟢 **Resting (Stable):** {report.graveyard_summary.get('resting', 0)}",
            f"- 🟡 **Aging (Outdated/Stale):** {report.graveyard_summary.get('aging', 0)}",
            f"- 🟣 **Whispering (Possibly Unused/Unresolved):** {report.graveyard_summary.get('whispering', 0)}",
            f"- 🔴 **Haunted (Security Advisories):** {report.graveyard_summary.get('haunted', 0)}",
            "",
        ]

        if report.ai_summary:
            lines.extend([
                "## 🧠 AI Ghost Examiner Summary",
                f"> **Inference Model:** `{report.ai_model_used or 'Deterministic Heuristic'}`",
                "",
                report.ai_summary,
                "",
            ])

        lines.extend([
            "## 🔍 Detailed Graveyard Findings",
            "",
        ])

        if not report.findings:
            lines.append("🎉 *No phantom concerns detected! The codebase appears peaceful and well-tended.*")
        else:
            for idx, finding in enumerate(report.findings, start=1):
                icon = {
                    "resting": "🟢",
                    "aging": "🟡",
                    "whispering": "🟣",
                    "haunted": "🔴",
                }.get(finding.graveyard_status.value, "⚪")

                lines.extend([
                    f"### {idx}. {icon} `{finding.package_name}` — {finding.title}",
                    f"- **Classification:** `{finding.graveyard_status.value.upper()}` ({finding.category.value})",
                    f"- **Severity:** `{finding.severity.value}` | **Verified:** `{'Yes' if finding.is_verified else 'Heuristic concern'}`",
                    f"- **Explanation:** {finding.explanation}",
                ])

                if finding.ai_explanation:
                    lines.append(f"- **AI Analysis:** *{finding.ai_explanation}*")

                if finding.evidence:
                    lines.append("- **Supporting Evidence:**")
                    for ev in finding.evidence:
                        lines.append(f"  - {ev}")

                lines.append(f"- **Recommended Next Step:** {finding.recommended_action}")
                lines.append(f"- **Evidence Source:** `{finding.evidence_source}`")
                lines.append("")

        lines.extend([
            "---",
            "## 🛡️ Limitations & Privacy Disclosures",
        ])
        for lim in report.limitations:
            lines.append(f"- {lim}")

        lines.extend([
            "",
            "*(This report was generated locally by Phantom Dependency. Source code was never uploaded or executed.)*",
        ])

        return "\n".join(lines)
