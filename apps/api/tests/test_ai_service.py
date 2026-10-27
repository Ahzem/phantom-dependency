import pytest
from app.services.ai_service import AIService, AIAnalysisOutput
from app.schemas.finding import Finding, FindingCategory, Severity, GraveyardStatus


@pytest.mark.asyncio
async def test_ai_fallback_deterministic():
    service = AIService()
    findings = [
        Finding(
            id="f-1",
            package_name="minimist",
            category=FindingCategory.SECURITY,
            severity=Severity.HIGH,
            graveyard_status=GraveyardStatus.HAUNTED,
            title="Prototype Pollution",
            explanation="Known vulnerability in minimist",
            evidence=["Advisory ID: GHSA-1234"],
            evidence_source="Mock DB",
            recommended_action="Upgrade to 1.2.6",
            is_verified=True,
        ),
        Finding(
            id="f-2",
            package_name="moment",
            category=FindingCategory.UNUSED,
            severity=Severity.MEDIUM,
            graveyard_status=GraveyardStatus.WHISPERING,
            title="Possibly Unused",
            explanation="Not referenced in source",
            evidence=["Zero imports"],
            evidence_source="Static scan",
            recommended_action="Remove if unneeded",
            is_verified=False,
        ),
    ]

    stats = {"haunted": 1, "whispering": 1, "aging": 0, "resting": 3}
    fallback = service._deterministic_fallback("TestApp", findings, stats)

    assert isinstance(fallback, AIAnalysisOutput)
    assert len(fallback.explanations) == 2
    assert "minimist" in fallback.explanations[0].explanation
    assert "moment" in fallback.explanations[1].explanation
    assert "1 package(s) have verified security advisories" in fallback.overall_summary


def test_ai_parse_json_safely():
    service = AIService()
    raw_json = '{"overall_summary": "All good", "explanations": []}'
    parsed = service._parse_json_safely(raw_json)
    assert parsed == {"overall_summary": "All good", "explanations": []}

    markdown_fenced = 'Here is your report:\n```json\n{"overall_summary": "Fenced output", "explanations": []}\n```'
    parsed_fenced = service._parse_json_safely(markdown_fenced)
    assert parsed_fenced["overall_summary"] == "Fenced output"
