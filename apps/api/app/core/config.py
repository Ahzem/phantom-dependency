from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    app_name: str = "Phantom Dependency API"
    app_version: str = "0.1.0"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Ollama Local AI
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "gemma3:1b"
    ollama_timeout_seconds: float = 60.0

    # Optional Network Enrichment
    enable_network_enrichment: bool = False
    npm_registry_url: str = "https://registry.npmjs.org"
    osv_api_url: str = "https://api.osv.dev/v1/query"
    request_timeout_seconds: float = 10.0

    # Storage
    data_dir: str = ".data"

    model_config = SettingsConfigDict(
        env_prefix="PHANTOM_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def reports_dir(self) -> Path:
        base = Path(__file__).resolve().parent.parent.parent
        target = base / self.data_dir / "reports"
        target.mkdir(parents=True, exist_ok=True)
        return target


@lru_cache
def get_settings() -> Settings:
    return Settings()
