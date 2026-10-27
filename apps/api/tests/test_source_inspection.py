from pathlib import Path
from app.services.source_inspection_service import SourceInspectionService


def test_source_inspection_sample_project(sample_project_path: Path):
    deps = ["chalk", "lodash", "minimist", "moment", "prettier", "fake-ghost-helper"]
    results = SourceInspectionService.inspect_usage(sample_project_path, deps)

    # chalk, lodash, minimist are imported in src/index.js
    assert results["chalk"]["is_used"] is True
    assert results["chalk"]["references_count"] >= 1

    assert results["lodash"]["is_used"] is True
    assert results["lodash"]["references_count"] >= 1

    assert results["minimist"]["is_used"] is True

    # moment is NOT imported anywhere in src/
    assert results["moment"]["is_used"] is False
    assert results["moment"]["references_count"] == 0

    # fake-ghost-helper is NOT imported
    assert results["fake-ghost-helper"]["is_used"] is False

    # prettier is referenced in package.json scripts and is a known dev tool exception
    assert results["prettier"]["is_used"] is True
