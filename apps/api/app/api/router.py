from fastapi import APIRouter
from app.api.routes import health, ai, projects, analysis, reports

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(ai.router)
api_router.include_router(projects.router)
api_router.include_router(analysis.router)
api_router.include_router(reports.router)
