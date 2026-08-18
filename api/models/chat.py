"""
Modelos de dados para o servico de chat e streaming.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatFilters(BaseModel):
    """Filtros opcionais para pesquisa de viagens."""
    max_budget: Optional[float] = Field(default=None, description="Orcamento maximo pretendido")
    travelers: int = Field(default=1, ge=1, description="Numero de viajantes")
    direct_flights_only: bool = Field(default=False, description="Apenas voos diretos")


class ChatRequest(BaseModel):
    """Estrutura do pedido recebido no endpoint de chat."""
    message: str = Field(..., min_length=1, description="Mensagem ou indicacao em linguagem natural")
    conversation_id: Optional[str] = Field(default=None, description="Identificador unico da sessao de conversa")
    currency: str = Field(default="EUR", description="Moeda base")
    filters: Optional[ChatFilters] = Field(default_factory=ChatFilters, description="Filtros adicionais")


class HealthResponse(BaseModel):
    """Estrutura de resposta do endpoint de verificacao de estado."""
    status: str = "healthy"
    version: str = "0.1.0"
    services: Dict[str, str] = Field(
        default_factory=lambda: {
            "llm_groq": "standby",
            "mcp_kiwi": "standby",
            "mcp_tavily": "standby"
        }
    )
    timestamp: str
