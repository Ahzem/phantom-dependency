from pathlib import Path
import pytest
from app.services.investigation_service import InvestigationService
from app.schemas.project import ProjectScanRequest
from app.schemas.finding import GraveyardStatus


@pytest.mark.asyncio
async def test_run_investigation_sample_project(sample_project_path: Path):
    service = InvestigationService()
    req = ProjectScanRequest(
        project_path=str(sample_project_path),
        enable_enrichment=False,
        enable_ai=False,
    )

    report = await service.run_investigation(req)
    assert report.project_name == "sample-haunted-project"
    assert report.total_dependencies >= 5

    # Check graveyard census
    census = report.graveyard_summary
    assert census["haunted"] >= 1  # minimist
    assert census["aging"] >= 1    # lodash
    assert census["whispering"] >= 1  # moment and/or fake-ghost-helper
    assert census["resting"] >= 1  # chalk

    # Verify findings structure
    pkg_status_map = {f.package_name: f.graveyard_status for f in report.findings}
    assert pkg_status_map["minimist"] == GraveyardStatus.HAUNTED
    assert pkg_status_map["lodash"] == GraveyardStatus.AGING
    assert pkg_status_map["moment"] == GraveyardStatus.WHISPERING
    assert pkg_status_map["fake-ghost-helper"] == GraveyardStatus.WHISPERING
