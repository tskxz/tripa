"""
Engine de consolidacao financeira e calculo orcamenatario do Tripa AI.
"""
from typing import Dict, Any, Optional
from api.models.state import TripaAgentState


def calculate_trip_budget(
    flight_cost: float,
    hotel_cost_per_night: float,
    duration_days: int,
    passengers: int = 1,
    daily_food_and_transport: float = 35.0,
    daily_activities_cost: float = 15.0,
    max_budget: Optional[float] = None,
    currency: str = "EUR"
) -> Dict[str, Any]:
    """
    Consolida e calcula as despesas totais estimadas da viagem:
    Total Estimado = (Voos * passageiros) + (Alojamento * Noites) + (Diaria Alimentacao/Transporte + Atividades) * Dias * passageiros + Margem (10%)
    """
    nights = max(1, duration_days - 1) if duration_days > 1 else 1

    total_flights = round(flight_cost * passengers, 2)
    total_hotel = round(hotel_cost_per_night * nights, 2)
    
    daily_base = round(daily_food_and_transport * duration_days * passengers, 2)
    activities = round(daily_activities_cost * duration_days * passengers, 2)

    subtotal = total_flights + total_hotel + daily_base + activities
    emergency_buffer = round(subtotal * 0.10, 2)  # Margem de seguranca de 10%
    
    total_estimated = round(subtotal + emergency_buffer, 2)
    is_under_budget = (total_estimated <= max_budget) if max_budget else True

    return {
        "flights_cost": total_flights,
        "hotel_cost": total_hotel,
        "daily_food_and_transport": daily_base,
        "activities_cost": activities,
        "emergency_buffer": emergency_buffer,
        "total_estimated": total_estimated,
        "currency": currency,
        "is_under_budget": is_under_budget,
        "max_budget": max_budget,
        "duration_days": duration_days,
        "passengers": passengers,
        "nights": nights
    }


async def estimate_daily_costs_with_llm(
    destination: str,
    travel_style: str,
    duration_days: int
) -> tuple[float, float]:
    """
    Usa o Groq LLM para estimar o custo diario realista de (alimentacao + transporte local)
    e o custo diario de (atividades/atracoes) em EUR para o destino e estilo indicados.
    Retorna tupla (daily_food_and_transport, daily_activities).
    """
    try:
        from api.services.tools.groq_client import get_groq_llm
        llm = get_groq_llm(model_name="openai/gpt-oss-20b", temperature=0.2)
        if not llm:
            return _fallback_daily_costs(destination, travel_style)

        prompt = (
            f"Es um analista financeiro de viagens. Estima os custos diarios realisticos em EUR para um turista em {destination} com estilo '{travel_style}'.\n"
            f"Responde APENAS no formato JSON exato abaixo, sem texto extra, sem markdown, sem explicacoes:\n"
            f'{{"daily_food_transport": 25.0, "daily_activities": 12.0}}\n'
            f"Regras:\n"
            f"- daily_food_transport: custo medio por pessoa/dia para 3 refeicoes economicas/medias + transportes locais (metro/bus/autocarro) em {destination}.\n"
            f"- daily_activities: custo medio por pessoa/dia para entradas em museus/atracoes em {destination}.\n"
        )

        res = await llm.ainvoke(prompt)
        raw = res.content.strip() if hasattr(res, "content") else str(res).strip()
        import json
        # Limpar possiveis blocos ```json ... ```
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        data = json.loads(raw)
        food_tr = float(data.get("daily_food_transport", 35.0))
        act = float(data.get("daily_activities", 15.0))
        return food_tr, act
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning(f"Estimativa LLM de custos diarios falhou: {e}")
        return _fallback_daily_costs(destination, travel_style)


def _fallback_daily_costs(destination: str, travel_style: str) -> tuple[float, float]:
    dest = destination.lower()
    style = travel_style.lower()
    
    daily_food_tr = 35.0
    daily_act = 15.0

    if any(cheap in dest for cheap in ["tailandia", "thailand", "bali", "indonesia", "marrocos", "fez", "marrakech", "india", "vietnam"]):
        daily_food_tr = 15.0
        daily_act = 8.0
    elif any(expensive in dest for expensive in ["dubai", "nova iorque", "new york", "las vegas", "londres", "london", "paris", "tokyo", "japao", "japan", "suica"]):
        daily_food_tr = 60.0
        daily_act = 30.0

    if "luxo" in style or "premium" in style:
        daily_food_tr *= 2.0
        daily_act *= 2.0

    return daily_food_tr, daily_act


async def compute_budget_from_state(state: TripaAgentState) -> Dict[str, Any]:
    """
    Extrai do estado os custos obtidos pelas ferramentas e calcula o resumo orcamental
    utilizando o LLM para estimar os custos diarios de acordo com a especificidade do destino.
    """
    flight_options = state.get("flight_options", [])
    hotel_options = state.get("hotel_options", [])
    duration_days = state.get("duration_days", 3)
    passengers = state.get("passengers", 1)
    max_budget = state.get("max_budget")
    currency = state.get("currency", "EUR")

    destination = state.get("destination", "")
    travel_style = state.get("travel_style", "economico")

    # Obter estimativa de custos diarios via LLM
    daily_food_and_transport, daily_activities_cost = await estimate_daily_costs_with_llm(
        destination=destination,
        travel_style=travel_style,
        duration_days=duration_days
    )

    # Obter preco do primeiro voo
    flight_cost = 65.0
    if flight_options:
        flight_cost = flight_options[0].get("price", 65.0)

    # Obter preco por noite do alojamento
    hotel_cost_per_night = 50.0
    if hotel_options:
        hotel_cost_per_night = hotel_options[0].get("estimated_price_per_night", 50.0)

    return calculate_trip_budget(
        flight_cost=flight_cost,
        hotel_cost_per_night=hotel_cost_per_night,
        duration_days=duration_days,
        passengers=passengers,
        daily_food_and_transport=daily_food_and_transport,
        daily_activities_cost=daily_activities_cost,
        max_budget=max_budget,
        currency=currency
    )
