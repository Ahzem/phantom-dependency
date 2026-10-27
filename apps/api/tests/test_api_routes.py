from pathlib import Path
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_validate_endpoint(async_client: AsyncClient, sample_project_path: Path):
    resp = await async_client.post(
        "/api/v1/projects/validate",
        json={"project_path": str(sample_project_path)},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is True
    assert data["project_name"] == "sample-haunted-project"
    assert data["has_lockfile"] is True
    assert data["lockfile_type"] == "npm"


@pytest.mark.asyncio
async def test_scan_and_report_endpoints(async_client: AsyncClient, sample_project_path: Path):
    scan_resp = await async_client.post(
        "/api/v1/projects/scan",
        json={
            "project_path": str(sample_project_path),
            "enable_enrichment": False,
            "enable_ai": False,
        },
    )
    assert scan_resp.status_code == 200
    report = scan_resp.json()
    report_id = report["id"]
    assert report["project_name"] == "sample-haunted-project"

    # Get report
    get_resp = await async_client.get(f"/api/v1/reports/{report_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == report_id

    # Export markdown
    md_resp = await async_client.get(f"/api/v1/reports/{report_id}/export?format=markdown")
    assert md_resp.status_code == 200
    assert "Phantom Dependency Investigation Report" in md_resp.text
