"""
Orquestrador de Grafo Multi-Agente em LangGraph do Tripa AI.
Executa os nos de extracao de intencao, pesquisas paralelas (Kiwi, Booking, Tavily) e calculo orcamental.
"""
import asyncio
import json
import logging
import re
import uuid
from typing import AsyncGenerator, Dict, Any, List

from langgraph.graph import StateGraph, END
from api.models.state import TripaAgentState
from api.services.tools.kiwi import fetch_flights_via_mcp
from api.services.tools.booking import generate_booking_url, get_booking_accommodations_structured
from api.services.tools.tavily import execute_tavily_search
from api.services.tools.groq_client import get_groq_llm
from api.services.agents.budget import compute_budget_from_state
from api.models.travel import BookingSearchQuery

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Nos do Grafo LangGraph
# ---------------------------------------------------------------------------

async def parse_intent_node(state: TripaAgentState) -> TripaAgentState:
    """
    No 1: Analisa o pedido em linguagem natural e extrai entidades essenciais.
    """
    user_query = state.get("user_query", "")
    filters = state.get("filters", {})
    query_lower = user_query.lower()
    
    # 1. Extracao de Origem
    origin = "Porto"
    if re.search(r"\b(?:partida|saindo|de|origem)\s+(?:de\s+)?lisboa\b", query_lower) or "lisboa" in query_lower:
        origin = "Lisboa"
    elif re.search(r"\b(?:partida|saindo|de|origem)\s+(?:de\s+)?porto\b", query_lower) or "porto" in query_lower:
        origin = "Porto"
    elif re.search(r"\b(?:partida|saindo|de|origem)\s+(?:de\s+)?faro\b", query_lower) or "faro" in query_lower:
        origin = "Faro"

    # 2. Extracao de Destino
    DEST_MAP = {
        "barcelona": "Barcelona", "madrid": "Madrid", "paris": "Paris",
        "roma": "Roma", "rome": "Roma", "londres": "Londres", "london": "Londres",
        "amsterdam": "Amesterdão", "amesterdao": "Amesterdão", "berlim": "Berlim", "berlin": "Berlim",
        "praga": "Praga", "prague": "Praga", "milao": "Milão", "milan": "Milão",
        "valencia": "Valência", "sevilha": "Sevilha", "seville": "Sevilha", "veneza": "Veneza", "venice": "Veneza",
        "florenca": "Florença", "florence": "Florença", "napoles": "Nápoles", "naples": "Nápoles",
        "atenas": "Atenas", "athens": "Atenas", "viena": "Viena", "vienna": "Viena",
        "budapest": "Budapeste", "budapeste": "Budapeste", "varsovia": "Varsóvia", "warsaw": "Varsóvia",
        "brasil": "Brasil", "brazil": "Brasil", "rio de janeiro": "Rio de Janeiro", "salvador": "Salvador",
        "nova iorque": "Nova Iorque", "new york": "Nova Iorque", "toquio": "Tóquio", "tokyo": "Tóquio",
        "dubai": "Dubai", "cancun": "Cancún", "maldivas": "Maldivas", "maldives": "Maldivas",
        "tailandia": "Tailândia", "thailand": "Tailândia", "banguecoque": "Banguecoque", "bangkok": "Banguecoque"
    }

    destination = None
    for alias, city_name in DEST_MAP.items():
        if alias in query_lower:
            # Ignorar se o alias for a origem detetada na clausula de partida
            if city_name.lower() == origin.lower() and re.search(r"\b(?:partida|saindo|de|origem)\s+(?:de\s+)?" + alias, query_lower):
                continue
            destination = city_name
            break

    if not destination:
        match = re.search(r'\b(?:em|para|ir\s+ao?|até|no|na)\s+([A-ZÁÉÍÓÚÀÂÊÔÃÕÜa-záéíóúàâêôãõü]+(?:\s+[A-ZÁÉÍÓÚÀÂÊÔÃÕÜa-záéíóúàâêôãõü]+)?)', user_query, re.IGNORECASE)
        if match:
            extracted = match.group(1).strip()
            extracted = re.sub(r"\b(com|por|em|de|para|durante|foco|voos|partida)\b.*$", "", extracted, flags=re.IGNORECASE).strip()
            if extracted and extracted.lower() not in ["mim", "nos", "um", "uma", "2", "3", "4", "5"]:
                destination = extracted.capitalize()

    if not destination:
        destination = "Barcelona"

    # 3. Extracao de Duracao
    duration_days = 4
    days_match = re.search(r"(\d+)\s*dias?", query_lower)
    if days_match:
        duration_days = int(days_match.group(1))
    elif "fim de semana" in query_lower or "weekend" in query_lower:
        duration_days = 3
    elif "semana" in query_lower or "week" in query_lower:
        duration_days = 7

    passengers = filters.get("travelers", 1)
    max_budget = filters.get("max_budget")

    if not max_budget:
        budget_match = re.search(r"(\d+)\s*(eur|euros|€)", query_lower)
        if budget_match:
            max_budget = float(budget_match.group(1))

    state["origin"] = origin
    state["destination"] = destination
    state["date_from"] = "2026-11-12"
    state["date_to"] = "2026-11-16"
    state["duration_days"] = duration_days
    state["passengers"] = passengers
    state["max_budget"] = max_budget
    state["travel_style"] = "economico"
    
    return state


async def parallel_search_node(state: TripaAgentState) -> TripaAgentState:
    """
    No 2: Executa pesquisas simultaneas no Kiwi (Voos), Booking (Hoteis) e Tavily (Atracoes/Gastronomia).
    """
    origin = state.get("origin", "Porto")
    destination = state.get("destination", "Barcelona")
    date_from = state.get("date_from", "2026-11-12")
    date_to = state.get("date_to", "2026-11-16")
    passengers = state.get("passengers", 1)

    # 1. Pesquisa de Voos (Kiwi MCP)
    raw_flights = await fetch_flights_via_mcp(
        origin=origin,
        destination=destination,
        date_from=date_from,
        date_to=date_to,
        passengers=passengers,
        currency=state.get("currency", "EUR")
    )

    # 2. Pesquisa de Alojamento (Booking Helper)
    booking_query = BookingSearchQuery(
        destination=destination,
        checkin_date=date_from,
        checkout_date=date_to,
        adults=passengers,
        rooms=1,
        budget_level="budget"
    )
    booking_res = get_booking_accommodations_structured(booking_query)
    
    hotel_options = [
        {
            "id": "ht_1",
            "name": rec.name,
            "neighborhood": rec.area,
            "rating": 8.5,
            "estimated_price_per_night": rec.estimated_price_per_night,
            "total_price": rec.estimated_price_per_night * max(1, state.get("duration_days", 4) - 1),
            "currency": state.get("currency", "EUR"),
            "booking_url": rec.booking_url
        }
        for rec in booking_res.recommendations
    ]

    # 3. Pesquisa Web (Tavily)
    tavily_data = await execute_tavily_search(
        query=f"atracoes imperdiveis e restaurantes economicos em {destination} roteiro {state.get('duration_days', 4)} dias",
        max_results=3
    )

    state["flight_options"] = raw_flights
    state["hotel_options"] = hotel_options
    state["tavily_results"] = tavily_data.get("results", [])
    
    return state


async def calculate_budget_node(state: TripaAgentState) -> TripaAgentState:
    """
    No 3: Calcula e consolida o resumo financeiro da viagem.
    """
    budget_summary = compute_budget_from_state(state)
    state["budget_summary"] = budget_summary
    return state


def clean_tavily_snippet(content: str, max_chars: int = 220) -> str:
    """Limpa snippets da Tavily removendo artefactos de HTML, links internos e truncamentos feios."""
    if not content:
        return ""
    text = re.sub(r"^Title:\s*[^:]+:\s*", "", content)
    text = re.sub(r"(?:Leia mais|Read more|Ver mais|Saiba mais)\s*[→►»]?", "", text, flags=re.IGNORECASE)
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    
    if len(text) > max_chars:
        truncated = text[:max_chars]
        last_period = truncated.rfind(".")
        if last_period > max_chars // 2:
            text = truncated[:last_period + 1]
        else:
            text = truncated.rstrip() + "..."
    elif not text.endswith(".") and len(text) > 0:
        text += "."
        
    return text


async def generate_response_node(state: TripaAgentState) -> TripaAgentState:
    """
    No 4: Sintetiza a resposta final estruturada em Markdown.
    """
    destination = state.get("destination", "Destino")
    origin = state.get("origin", "Origem")
    duration = state.get("duration_days", 4)
    budget = state.get("budget_summary", {})
    flights = state.get("flight_options", [])
    hotels = state.get("hotel_options", [])
    tavily_items = state.get("tavily_results", [])

    flight_info = flights[0] if flights else {}
    hotel_info = hotels[0] if hotels else {}

    text_parts = [
        f"### Roteiro Personalizado para {destination} ({duration} dias)\n\n",
        f"Com base na sua solicitacao, analisamos a rota ideal de **{origin}** para **{destination}** focando no melhor custo-beneficio:\n\n",
        f"#### 1. Voos Recomendados (Kiwi.com)\n",
        f"- **Companhia**: {flight_info.get('airline', 'Companhia Low-Cost')}\n",
        f"- **Rota**: {origin} -> {destination}\n",
        f"- **Preco Estimado**: {flight_info.get('price', 65.0)} {state.get('currency', 'EUR')}\n",
        f"- **Reserva Direta**: [Ver Voos no Kiwi.com]({flight_info.get('booking_url', 'https://www.kiwi.com')})\n\n",
        f"#### 2. Alojamento Sugerido (Booking.com)\n",
        f"- **Opcao**: {hotel_info.get('name', 'Hotel Economico Central')}\n",
        f"- **Zona**: {hotel_info.get('neighborhood', 'Centro Historico')}\n",
        f"- **Preco por Noite**: {hotel_info.get('estimated_price_per_night', 50.0)} {state.get('currency', 'EUR')}\n",
        f"- **Reserva Direta**: [Reservar no Booking.com]({hotel_info.get('booking_url', 'https://www.booking.com')})\n\n",
        f"#### 3. Dicas Turisticas e Gastronomicas\n"
    ]

    for item in tavily_items[:3]:
        raw_title = item.get("title", "Dica de Viagem")
        title = raw_title.split(" - ")[0].split(" | ")[0].split(":")[0].strip()
        if not title:
            title = "Dica de Viagem"
        raw_content = item.get("content", "")
        clean_content = clean_tavily_snippet(raw_content)
        if clean_content:
            text_parts.append(f"- **{title}**: {clean_content}\n")

    text_parts.append(
        f"\n#### 4. Total Estimado da Viagem: **{budget.get('total_estimated', 0)} {state.get('currency', 'EUR')}** "
        f"({'Dentro do orcamento!' if budget.get('is_under_budget') else 'Acima do teto pretendido.'})\n"
    )

    state["final_response_text"] = "".join(text_parts)
    return state


# ---------------------------------------------------------------------------
# Construcao do Grafo LangGraph
# ---------------------------------------------------------------------------

def build_tripa_graph():
    """
    Compila o StateGraph do LangGraph.
    """
    workflow = StateGraph(TripaAgentState)

    workflow.add_node("parse_intent", parse_intent_node)
    workflow.add_node("parallel_search", parallel_search_node)
    workflow.add_node("calculate_budget", calculate_budget_node)
    workflow.add_node("generate_response", generate_response_node)

    workflow.set_entry_point("parse_intent")
    workflow.add_edge("parse_intent", "parallel_search")
    workflow.add_edge("parallel_search", "calculate_budget")
    workflow.add_edge("calculate_budget", "generate_response")
    workflow.add_edge("generate_response", END)

    return workflow.compile()


# ---------------------------------------------------------------------------
# Gerador de Eventos SSE para FastAPI Endpoint
# ---------------------------------------------------------------------------

async def run_tripa_graph_events(
    user_query: str,
    conversation_id: str,
    currency: str = "EUR",
    filters: Dict[str, Any] = None
) -> AsyncGenerator[str, None]:
    """
    Executa o grafo de agentes e emite eventos SSE compativeis em tempo real.
    """
    conv_id = conversation_id or str(uuid.uuid4())
    filters = filters or {}

    initial_state: TripaAgentState = {
        "user_query": user_query,
        "currency": currency,
        "filters": filters,
        "conversation_id": conv_id,
        "status_steps": []
    }

    # 1. Evento: Parse Intent
    step_1 = {"step_id": "parse_intent", "title": "A analisar indicacoes e restricoes de viagem", "status": "running"}
    yield f"event: step\ndata: {json.dumps(step_1, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.3)

    state = await parse_intent_node(initial_state)

    # 2. Evento: Parallel Search
    step_2 = {
        "step_id": "search_flights",
        "title": f"A pesquisar voos e hoteis ({state.get('origin')} -> {state.get('destination')})",
        "status": "running"
    }
    yield f"event: step\ndata: {json.dumps(step_2, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.4)

    state = await parallel_search_node(state)

    # Evento de resultados de voos (flight_results)
    flights = state.get("flight_options", [])
    origin_name = state.get("origin", "Origem")
    dest_name = state.get("destination", "Destino")
    if flights:
        flight_payload = {
            "flights": [
                {
                    "id": f.get("flight_id", "fl_1"),
                    "airline": f.get("airline", "Companhia"),
                    "flight_number": f.get("flight_number", "FR1234"),
                    "departure": {"airport": f.get("origin", origin_name), "time": f.get("departure_time", "2026-11-12T08:00:00")},
                    "arrival": {"airport": f.get("destination", dest_name), "time": f.get("arrival_time", "2026-11-12T11:00:00")},
                    "price": f.get("price", 65.0),
                    "currency": currency,
                    "booking_url": f.get("booking_url", "https://www.kiwi.com")
                }
                for f in flights[:2]
            ]
        }
        yield f"event: flight_results\ndata: {json.dumps(flight_payload, ensure_ascii=False)}\n\n"

    # Evento de resultados de hoteis (hotel_results)
    hotels = state.get("hotel_options", [])
    if hotels:
        hotel_payload = {
            "hotels": [
                {
                    "id": h.get("id", "ht_1"),
                    "name": h.get("name", "Hotel Recomendado"),
                    "neighborhood": h.get("neighborhood", "Centro"),
                    "rating": h.get("rating", 8.5),
                    "price_per_night": h.get("estimated_price_per_night", 50.0),
                    "total_price": h.get("total_price", 150.0),
                    "currency": currency,
                    "booking_url": h.get("booking_url", "https://www.booking.com")
                }
                for h in hotels[:2]
            ]
        }
        yield f"event: hotel_results\ndata: {json.dumps(hotel_payload, ensure_ascii=False)}\n\n"

    # 3. Evento: Calculate Budget
    step_3 = {"step_id": "calculate_budget", "title": "A calcular consolidacao orcamental detalhada", "status": "running"}
    yield f"event: step\ndata: {json.dumps(step_3, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.3)

    state = await calculate_budget_node(state)

    # Evento de resumo orcamental (budget_summary)
    budget = state.get("budget_summary", {})
    yield f"event: budget_summary\ndata: {json.dumps(budget, ensure_ascii=False)}\n\n"
    await asyncio.sleep(0.2)

    # 4. Evento: Response Generation
    state = await generate_response_node(state)
    final_text = state.get("final_response_text", "")

    # Streaming em chunks (message_delta)
    words = final_text.split(" ")
    for i in range(0, len(words), 4):
        chunk = " ".join(words[i:i+4]) + " "
        delta_payload = {"content": chunk}
        yield f"event: message_delta\ndata: {json.dumps(delta_payload, ensure_ascii=False)}\n\n"
        await asyncio.sleep(0.08)

    # 5. Evento: Done
    done_payload = {"status": "success", "conversation_id": conv_id}
    yield f"event: done\ndata: {json.dumps(done_payload, ensure_ascii=False)}\n\n"
