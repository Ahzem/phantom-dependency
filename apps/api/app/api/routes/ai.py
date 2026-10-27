from fastapi import APIRouter
from app.services.ai_service import AIService

router = APIRouter(tags=["AI"])
ai_service = AIService()


@router.get("/ai/status")
async def get_ai_status():
    return await ai_service.get_status()
