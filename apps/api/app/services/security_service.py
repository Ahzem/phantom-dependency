import asyncio
from typing import Dict, List, Optional
import httpx
from app.core.config import get_settings
from app.core.logging import logger
from app.utils.version_utils import clean_version


class SecurityService:
    def __init__(self):
        self.settings = get_settings()

    async def check_advisories(
        self,
        package_version_map: Dict[str, str],
        client: Optional[httpx.AsyncClient] = None,
    ) -> Dict[str, List[Dict]]:
        """
        Queries OSV.dev for known security advisories given package name and version.
        Returns map: {
            package_name: [
                {
                    "id": "GHSA-...",
                    "summary": "...",
                    "details": "...",
                    "severity": "...",
                    "database_specific": {...}
                }
            ]
        }
        """
        if not self.settings.enable_network_enrichment and not client:
            return {}

        results: Dict[str, List[Dict]] = {pkg: [] for pkg in package_version_map}
        should_close = False
        if not client:
            client = httpx.AsyncClient(timeout=self.settings.request_timeout_seconds)
            should_close = True

        async def query_osv(pkg: str, ver: str):
            cleaned = clean_version(ver)
            if not cleaned:
                return

            payload = {
                "package": {
                    "name": pkg,
                    "ecosystem": "npm",
                },
                "version": cleaned,
            }
            try:
                resp = await client.post(self.settings.osv_api_url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    vulns = data.get("vulns", [])
                    for v in vulns:
                        results[pkg].append({
                            "id": v.get("id"),
                            "summary": v.get("summary", "Security vulnerability reported"),
                            "details": v.get("details", ""),
                            "references": [r.get("url") for r in v.get("references", []) if r.get("url")][:3],
                            "published": v.get("published"),
                        })
            except Exception as e:
                logger.debug(f"OSV query failed for {pkg}@{cleaned}: {e}")

        try:
            batch_size = 10
            items = list(package_version_map.items())
            for i in range(0, len(items), batch_size):
                batch = items[i : i + batch_size]
                await asyncio.gather(*(query_osv(p, v) for p, v in batch))
        finally:
            if should_close:
                await client.aclose()

        return results
