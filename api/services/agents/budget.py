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


def compute_budget_from_state(state: TripaAgentState) -> Dict[str, Any]:
    """
    Extrai do estado os custos obtidos pelas ferramentas e calcula o resumo orcamental.
    """
    flight_options = state.get("flight_options", [])
    hotel_options = state.get("hotel_options", [])
    duration_days = state.get("duration_days", 3)
    passengers = state.get("passengers", 1)
    max_budget = state.get("max_budget")
    currency = state.get("currency", "EUR")

    destination = state.get("destination", "").lower()
    travel_style = state.get("travel_style", "economico").lower()

    # Preço base diário de comida + transportes por pessoa
    daily_food_and_transport = 35.0
    daily_activities_cost = 15.0

    if any(cheap in destination for cheap in ["tailandia", "thailand", "bali", "indonesia", "marrocos", "fez", "marrakech", "india", "vietnam"]):
        daily_food_and_transport = 15.0
        daily_activities_cost = 8.0
    elif any(expensive in destination for expensive in ["dubai", "nova iorque", "new york", "las vegas", "londres", "london", "paris", "tokyo", "japao", "japan", "suica"]):
        daily_food_and_transport = 60.0
        daily_activities_cost = 30.0

    if "luxo" in travel_style or "premium" in travel_style:
        daily_food_and_transport *= 2.0
        daily_activities_cost *= 2.0

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
