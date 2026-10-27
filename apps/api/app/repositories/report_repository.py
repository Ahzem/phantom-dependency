import json
from pathlib import Path
from typing import List, Optional
from app.core.config import get_settings
from app.schemas.report import InvestigationReport, ReportListItem
from app.core.logging import logger


class ReportRepository:
    def __init__(self):
        self.settings = get_settings()

    @property
    def reports_dir(self) -> Path:
        return self.settings.reports_dir

    def save_report(self, report: InvestigationReport) -> None:
        file_path = self.reports_dir / f"{report.id}.json"
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(report.model_dump_json(indent=2))
        except Exception as e:
            logger.error(f"Failed to save report {report.id}: {e}")

    def get_report(self, report_id: str) -> Optional[InvestigationReport]:
        file_path = self.reports_dir / f"{report_id}.json"
        if not file_path.exists():
            return None
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return InvestigationReport(**data)
        except Exception as e:
            logger.error(f"Failed to load report {report_id}: {e}")
            return None

    def list_reports(self, limit: int = 50) -> List[ReportListItem]:
        items: List[ReportListItem] = []
        try:
            files = sorted(self.reports_dir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
            for f in files[:limit]:
                try:
                    with open(f, "r", encoding="utf-8") as rf:
                        data = json.load(rf)
                        summary = data.get("graveyard_summary", {})
                        items.append(
                            ReportListItem(
                                id=data.get("id", f.stem),
                                project_name=data.get("project_name", "Unknown"),
                                project_path=data.get("project_path", ""),
                                created_at=data.get("created_at", ""),
                                total_dependencies=data.get("total_dependencies", 0),
                                findings_count=len(data.get("findings", [])),
                                haunted_count=summary.get("haunted", 0),
                                overall_health_score=data.get("overall_health_score", 100),
                            )
                        )
                except Exception as e:
                    logger.debug(f"Error reading report summary {f.name}: {e}")
        except Exception as e:
            logger.warning(f"Error listing reports: {e}")

        return items
