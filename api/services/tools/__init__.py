"""
Modulo central de exportacao das ferramentas do Tripa AI (Kiwi MCP, Tavily, Booking e Groq).
"""
from api.services.tools.kiwi import (
    search_kiwi_flights_tool,
    search_flights_structured,
    fetch_flights_via_mcp
)
from api.services.tools.tavily import (
    search_tavily_experiences_tool,
    search_tavily_structured,
    execute_tavily_search
)
from api.services.tools.booking import (
    generate_booking_accommodation_tool,
    generate_booking_url,
    get_booking_accommodations_structured
)
from api.services.tools.groq_client import (
    get_groq_llm,
    get_llm_with_tools
)

# Lista unificada de ferramentas para registo no LangChain / LangGraph
TRIPA_TOOLS = [
    search_kiwi_flights_tool,
    search_tavily_experiences_tool,
    generate_booking_accommodation_tool
]

__all__ = [
    "search_kiwi_flights_tool",
    "search_flights_structured",
    "fetch_flights_via_mcp",
    "search_tavily_experiences_tool",
    "search_tavily_structured",
    "execute_tavily_search",
    "generate_booking_accommodation_tool",
    "generate_booking_url",
    "get_booking_accommodations_structured",
    "get_groq_llm",
    "get_llm_with_tools",
    "TRIPA_TOOLS"
]
