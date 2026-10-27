from typing import List
from fastapi import APIRouter, HTTPException, status
from app.schemas.project import ProjectScanRequest
from app.schemas.finding import Finding
from app.schemas.report import InvestigationReport
from app.services.investigation_service import InvestigationService
from app.services.ai_service import AIService
from app.repositories.report_repository import ReportRepository

router = APIRouter(tags=["Analysis"])
investigation_service = InvestigationService()
report_repo = ReportRepository()
ai_service = AIService()


@router.post("/analysis/run", response_model=InvestigationReport)
async def run_analysis_endpoint(request: ProjectScanRequest):
    return await investigation_service.run_investigation(request)


@router.get("/analysis/{analysis_id}", response_model=InvestigationReport)
async def get_analysis_endpoint(analysis_id: str):
    report = report_repo.get_report(analysis_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis report '{analysis_id}' not found",
        )
    return report


@router.get("/analysis/{analysis_id}/findings", response_model=List[Finding])
async def get_analysis_findings_endpoint(analysis_id: str):
    report = report_repo.get_report(analysis_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis report '{analysis_id}' not found",
        )
    return report.findings


@router.post("/analysis/{analysis_id}/explain", response_model=InvestigationReport)
async def explain_analysis_endpoint(analysis_id: str):
    report = report_repo.get_report(analysis_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis report '{analysis_id}' not found",
        )

    stats = {
        "total_deps": report.total_dependencies,
        "haunted": report.graveyard_summary.get("haunted", 0),
        "aging": report.graveyard_summary.get("aging", 0),
        "whispering": report.graveyard_summary.get("whispering", 0),
        "resting": report.graveyard_summary.get("resting", 0),
        "health_score": report.overall_health_score,
    }

    ai_out = await ai_service.explain_investigation(
        project_name=report.project_name,
        findings=report.findings,
        stats=stats,
    )

    report.ai_summary = ai_out.overall_summary
    report.is_ai_generated = True

    expl_map = {e.finding_id: e for e in ai_out.explanations}
    for f in report.findings:
        if f.id in expl_map:
            f.ai_explanation = expl_map[f.id].explanation
            if expl_map[f.id].recommended_action:
                f.recommended_action = expl_map[f.id].recommended_action

    report_repo.save_report(report)
    return report
