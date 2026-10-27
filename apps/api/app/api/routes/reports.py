from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import PlainTextResponse, JSONResponse
from app.schemas.report import InvestigationReport, ReportListItem
from app.repositories.report_repository import ReportRepository
from app.services.report_service import ReportService

router = APIRouter(tags=["Reports"])
report_repo = ReportRepository()


@router.get("/reports", response_model=List[ReportListItem])
async def list_reports_endpoint(limit: int = Query(default=50, ge=1, le=100)):
    return report_repo.list_reports(limit=limit)


@router.get("/reports/{report_id}", response_model=InvestigationReport)
async def get_report_endpoint(report_id: str):
    report = report_repo.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found",
        )
    return report


@router.get("/reports/{report_id}/export")
async def export_report_endpoint(
    report_id: str,
    format: str = Query(default="markdown", pattern="^(markdown|json)$"),
):
    report = report_repo.get_report(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found",
        )

    if format == "json":
        return JSONResponse(
            content=report.model_dump(),
            headers={
                "Content-Disposition": f'attachment; filename="phantom-{report.project_name}-{report.id}.json"'
            },
        )
    else:
        markdown_text = ReportService.generate_markdown_report(report)
        return PlainTextResponse(
            content=markdown_text,
            media_type="text/markdown",
            headers={
                "Content-Disposition": f'attachment; filename="phantom-{report.project_name}-{report.id}.md"'
            },
        )
