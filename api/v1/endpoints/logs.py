"""
Endpoint /logs — expoe os logs do agente Tripa em tempo real para debug.
Apenas para uso em desenvolvimento/staging; nao expor em producao sem autenticacao.
"""
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from api.core.log_store import get_log_entries, clear_logs

router = APIRouter()


@router.get(
    "/logs",
    summary="Logs do Agente (debug)",
    tags=["Debug"],
)
async def get_logs(
    limit: int = Query(default=100, ge=1, le=200, description="Numero maximo de entradas a devolver"),
    level: str = Query(default="", description="Filtrar por nivel: DEBUG, INFO, WARNING, ERROR"),
) -> JSONResponse:
    """
    Devolve os ultimos logs do agente Tripa.
    Util para perceber se o Ponto 3 foi gerado pelo LLM ou pelo fallback curado.
    """
    entries = get_log_entries(limit=limit)
    if level:
        level_upper = level.upper()
        entries = [e for e in entries if e["level"] == level_upper]
    return JSONResponse(
        content={
            "total": len(entries),
            "entries": entries,
        }
    )


@router.delete(
    "/logs",
    summary="Limpar logs (debug)",
    tags=["Debug"],
)
async def delete_logs() -> JSONResponse:
    """Limpa o buffer de logs em memoria."""
    clear_logs()
    return JSONResponse(content={"status": "cleared"})
