"""
Endpoint de chat e planeamento de viagens com streaming Server-Sent Events (SSE).
"""
import asyncio
import json
import uuid
from typing import AsyncGenerator
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from api.models.chat import ChatRequest

router = APIRouter()


async def generate_chat_events(chat_request: ChatRequest) -> AsyncGenerator[str, None]:
    """
    Gera sequencia de eventos SSE para demonstracao de infraestrutura e comunicacao em tempo real.
    """
    conversation_id = chat_request.conversation_id or str(uuid.uuid4())
    user_query = chat_request.message.strip()

    # 1. Evento de inicio de analise do pedido
    step_1 = {
        "step_id": "parse_intent",
        "title": "A analisar indicacoes e restricoes de viagem",
        "status": "running"
    }
    yield f"event: step\ndata: {json.dumps(step_1, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.5)

    # 2. Evento de pesquisa de rotas e voos
    step_2 = {
        "step_id": "search_flights",
        "title": "A verificar combinacoes e tarifas otimizadas",
        "status": "running"
    }
    yield f"event: step\ndata: {json.dumps(step_2, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.6)

    # 3. Evento de streaming de texto / resposta sintetizada
    intro_text = (
        f"Recebido pedido de planeamento para: \"{user_query}\". "
        f"A infraestrutura FastAPI e Next.js esta totalmente operacional com streaming SSE ativo."
    )

    words = intro_text.split(" ")
    for i in range(0, len(words), 3):
        chunk = " ".join(words[i:i+3]) + " "
        delta_payload = {"content": chunk}
        yield f"event: message_delta\ndata: {json.dumps(delta_payload, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.15)

    # 4. Evento de resumo orcamental demonstrativo
    budget_payload = {
        "flights_cost": 85.0,
        "hotel_cost": 120.0,
        "daily_food_and_transport": 140.0,
        "activities_cost": 45.0,
        "emergency_buffer": 39.0,
        "total_estimated": 429.0,
        "currency": chat_request.currency,
        "is_under_budget": True
    }
    yield f"event: budget_summary\ndata: {json.dumps(budget_payload, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.3)

    # 5. Evento de conclusao
    done_payload = {
        "status": "success",
        "conversation_id": conversation_id
    }
    yield f"event: done\ndata: {json.dumps(done_payload, ensure_ascii=False)}\n\n"


@router.post("/chat/stream", summary="Streaming SSE de Planeamento")
async def chat_stream(request: Request, chat_request: ChatRequest) -> StreamingResponse:
    """
    Recebe indicacoes do utilizador e transmite eventos em tempo real via Server-Sent Events.
    """
    return StreamingResponse(
        generate_chat_events(chat_request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
