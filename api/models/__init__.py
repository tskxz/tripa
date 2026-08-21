"""
Modelos e esquemas de dados da aplicacao.
"""
from api.models.chat import ChatRequest, ChatFilters, HealthResponse
from api.models.travel import (
    FlightSearchQuery,
    FlightSearchResult,
    FlightOption,
    BookingSearchQuery,
    BookingSearchResult,
    HotelRecommendation,
    TavilySearchQuery,
    TavilySearchResult
)
from api.models.state import TripaAgentState

__all__ = [
    "ChatRequest",
    "ChatFilters",
    "HealthResponse",
    "FlightSearchQuery",
    "FlightSearchResult",
    "FlightOption",
    "BookingSearchQuery",
    "BookingSearchResult",
    "HotelRecommendation",
    "TavilySearchQuery",
    "TavilySearchResult",
    "TripaAgentState"
]
