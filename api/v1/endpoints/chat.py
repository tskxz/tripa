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

from api.services.agents.graph import run_tripa_graph_events

router = APIRouter()


@router.post("/chat/stream", summary="Streaming SSE de Planeamento")
async def chat_stream(request: Request, chat_request: ChatRequest) -> StreamingResponse:
    """
    Recebe indicacoes do utilizador e transmite eventos em tempo real via Server-Sent Events (LangGraph).
    """
    filters_dict = chat_request.filters.model_dump() if chat_request.filters else {}
    
    return StreamingResponse(
        run_tripa_graph_events(
            user_query=chat_request.message.strip(),
            conversation_id=chat_request.conversation_id or "",
            currency=chat_request.currency,
            filters=filters_dict
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

