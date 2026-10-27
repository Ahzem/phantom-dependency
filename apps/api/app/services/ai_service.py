import json
import re
from typing import Dict, List, Optional, Any
import httpx
from pydantic import BaseModel, Field
from app.core.config import get_settings
from app.core.logging import logger
from app.schemas.finding import Finding


class AIFindingExplanation(BaseModel):
    finding_id: str
    explanation: str
    recommended_action: str


class AIAnalysisOutput(BaseModel):
    overall_summary: str = Field(..., description="2-3 sentence executive summary of project health")
    explanations: List[AIFindingExplanation] = Field(default_factory=list)


class AIService:
    def __init__(self):
        self.settings = get_settings()

    async def get_status(self) -> Dict[str, Any]:
        """Checks if Ollama is reachable and if gemma3:1b is installed."""
        url = f"{self.settings.ollama_base_url.rstrip('/')}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    has_model = any(self.settings.ollama_model in m for m in models)
                    return {
                        "is_available": True,
                        "model_present": has_model,
                        "installed_models": models,
                        "target_model": self.settings.ollama_model,
                        "message": (
                            f"Ollama is running with {self.settings.ollama_model}"
                            if has_model
                            else f"Ollama is running, but model '{self.settings.ollama_model}' is not installed. Run: ollama pull {self.settings.ollama_model}"
                        ),
                    }
        except Exception as e:
            logger.debug(f"Ollama connection check failed: {e}")

        return {
            "is_available": False,
            "model_present": False,
            "installed_models": [],
            "target_model": self.settings.ollama_model,
            "message": f"Ollama is not reachable at {self.settings.ollama_base_url}. Start Ollama and run: ollama pull {self.settings.ollama_model}",
        }

    async def explain_investigation(
        self,
        project_name: str,
        findings: List[Finding],
        stats: Dict[str, Any],
    ) -> AIAnalysisOutput:
        """
        Invokes Ollama Gemma 3 1B with a compact summary of findings.
        Falls back deterministically if Ollama is offline or fails validation.
        """
        # If no findings, return clean summary
        if not findings:
            return AIAnalysisOutput(
                overall_summary=f"No phantom dependency issues detected in {project_name}. All analyzed packages appear actively maintained and referenced.",
                explanations=[],
            )

        status_info = await self.get_status()
        if not status_info["is_available"] or not status_info["model_present"]:
            logger.info("Ollama or Gemma 3 1B unavailable; using deterministic templates.")
            return self._deterministic_fallback(project_name, findings, stats)

        # Build compact payload for the model
        compact_findings = []
        for f in findings[:25]:  # keep token window compact for 1B model
            compact_findings.append({
                "id": f.id,
                "package": f.package_name,
                "category": f.category.value,
                "severity": f.severity.value,
                "graveyard_status": f.graveyard_status.value,
                "evidence": f.evidence[:3],
                "verified": f.is_verified,
            })

        system_prompt = (
            "You are Phantom Dependency AI, a serious developer assistant built for Hacktoberfest 'Ghost in the Machine'.\n"
            "Your job is to provide clear, grounded, plain-English explanations of dependency findings.\n"
            "CRITICAL RULES:\n"
            "1. Ground all explanations ONLY in the provided evidence. DO NOT invent versions, CVEs, dates, or commit histories.\n"
            "2. Never label a package abandoned, malicious, or vulnerable solely because it is old or has few recent commits.\n"
            "3. If details are missing or unknown, state that they are unknown.\n"
            "4. Return strictly valid JSON conforming to this schema:\n"
            '{"overall_summary": "string", "explanations": [{"finding_id": "string", "explanation": "string", "recommended_action": "string"}]}'
        )

        user_content = (
            f"Project: {project_name}\n"
            f"Stats: {stats}\n"
            f"Findings:\n{json.dumps(compact_findings, indent=2)}\n\n"
            "Analyze these findings and return the structured JSON output."
        )

        chat_url = f"{self.settings.ollama_base_url.rstrip('/')}/api/chat"
        payload = {
            "model": self.settings.ollama_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.settings.ollama_timeout_seconds) as client:
                resp = await client.post(chat_url, json=payload)
                if resp.status_code == 200:
                    raw_body = resp.json()
                    msg_content = raw_body.get("message", {}).get("content", "")
                    parsed = self._parse_json_safely(msg_content)
                    if parsed:
                        validated = AIAnalysisOutput(**parsed)
                        return validated
                    else:
                        logger.warning("Could not parse AI output as JSON, using fallback.")
        except Exception as e:
            logger.warning(f"Error querying Ollama: {e}")

        return self._deterministic_fallback(project_name, findings, stats)

    def _parse_json_safely(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            return json.loads(text)
        except Exception:
            # Try finding json block inside markdown fences
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
        return None

    def _deterministic_fallback(
        self, project_name: str, findings: List[Finding], stats: Dict[str, Any]
    ) -> AIAnalysisOutput:
        """
        Produces high-quality, evidence-backed explanations when AI is offline.
        """
        haunted_count = stats.get("haunted", 0)
        aging_count = stats.get("aging", 0)
        whispering_count = stats.get("whispering", 0)

        parts = [f"Analysis of '{project_name}' revealed {len(findings)} noteworthy dependency signal(s)."]
        if haunted_count > 0:
            parts.append(f"{haunted_count} package(s) have verified security advisories requiring priority remediation.")
        if aging_count > 0:
            parts.append(f"{aging_count} package(s) are running outdated releases.")
        if whispering_count > 0:
            parts.append(f"{whispering_count} package(s) are possibly unreferenced in source code or lack registry metadata.")

        overall_summary = " ".join(parts)

        explanations = []
        for f in findings:
            if f.category.value == "security":
                expl = (
                    f"A confirmed security advisory was identified for {f.package_name}."
                    f" Check advisory details and evaluate patching or upgrading to a secure version."
                )
                action = f"Review official advisory remediation and upgrade {f.package_name}."
            elif f.category.value == "outdated":
                cur = f.current_version or "installed"
                target = f.target_version or "latest"
                expl = (
                    f"{f.package_name} is running version {cur}, while version {target} is available."
                    f" Check the project changelog for breaking changes before upgrading."
                )
                action = f"Test compatibility in staging before upgrading {f.package_name}."
            elif f.category.value == "unused":
                expl = (
                    f"{f.package_name} is declared in your manifest, but static inspection found no direct imports"
                    f" or references in source files. It may be an unused remnant or invoked via dynamic configuration."
                )
                action = f"Verify whether {f.package_name} is needed at runtime or can be safely removed."
            elif f.category.value == "inactive":
                expl = (
                    f"{f.package_name} has not had a published release recently."
                    f" Older packages may still be feature-complete and stable; assess whether it fits your maintenance needs."
                )
                action = f"Inspect upstream repository maintenance status for {f.package_name}."
            else:
                expl = f"Investigation signal for {f.package_name}: {f.explanation}"
                action = f.recommended_action or "Review package configuration."

            explanations.append(
                AIFindingExplanation(
                    finding_id=f.id,
                    explanation=expl,
                    recommended_action=action,
                )
            )

        return AIAnalysisOutput(
            overall_summary=overall_summary,
            explanations=explanations,
        )
