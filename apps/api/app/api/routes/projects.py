from fastapi import APIRouter
from app.schemas.project import ProjectValidateRequest, ProjectValidateResponse, ProjectScanRequest
from app.schemas.report import InvestigationReport
from app.services.project_service import ProjectService
from app.services.investigation_service import InvestigationService

router = APIRouter(tags=["Projects"])
investigation_service = InvestigationService()


@router.post("/projects/validate", response_model=ProjectValidateResponse)
async def validate_project_endpoint(request: ProjectValidateRequest):
    return ProjectService.validate_project(request.project_path)


@router.post("/projects/scan", response_model=InvestigationReport)
async def scan_project_endpoint(request: ProjectScanRequest):
    return await investigation_service.run_investigation(request)
