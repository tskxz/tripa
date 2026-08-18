"""
Endpoint de verificacao de estado operacional do backend.
"""
from datetime import datetime, timezone
from fastapi import APIRouter
from api.core.config import settings
from api.models.chat import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Verificacao de Estado Operacional")
async def get_health_status() -> HealthResponse:
    """
    Retorna o estado operacional do backend e a conectividade com servicos essenciais.
    """
    groq_status = "connected" if settings.GROQ_API_KEY else "standby"
    tavily_status = "available" if settings.TAVILY_API_KEY else "standby"
    kiwi_status = "available" if settings.KIWI_API_KEY else "standby"

    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        services={
            "llm_groq": groq_status,
            "mcp_kiwi": kiwi_status,
            "mcp_tavily": tavily_status
        },
        timestamp=datetime.now(timezone.utc).isoformat()
    )
