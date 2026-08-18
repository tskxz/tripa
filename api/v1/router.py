"""
Roteador principal para agregacao de endpoints da API v1.
"""
from fastapi import APIRouter
from api.v1.endpoints import health, chat

api_router = APIRouter()

api_router.include_router(health.router, tags=["Saude e Diagnostico"])
api_router.include_router(chat.router, tags=["Chat e Planeamento"])
