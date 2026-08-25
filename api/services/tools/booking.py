"""
Gerador de hiperligacoes parametrizadas e sugestoes de alojamento no Booking.com.
Permite aos utilizadores navegar diretamente para hoteis pre-filtrados por data e capacidade.
"""
import urllib.parse
from typing import List, Optional
from langchain_core.tools import tool
from api.models.travel import BookingSearchQuery, BookingSearchResult, HotelRecommendation


def generate_booking_url(
    destination: str,
    checkin_date: str,
    checkout_date: str,
    adults: int = 2,
    rooms: int = 1,
    budget_level: str = "budget"
) -> str:
    """
    Gera um URL otimizado de pesquisa no Booking.com com parametros pre-preenchidos.
    """
    base_url = "https://www.booking.com/searchresults.html"
    params = {
        "ss": destination,
        "checkin": checkin_date,
        "checkout": checkout_date,
        "group_adults": str(adults),
        "no_rooms": str(rooms),
        "group_children": "0",
        "sb_travel_purpose": "leisure"
    }

    # Adiciona ordenacao por menor preco para perfis orcamentais economicos
    if budget_level == "budget":
        params["order"] = "price"

    encoded_params = urllib.parse.urlencode(params)
    return f"{base_url}?{encoded_params}"


@tool("generate_booking_accommodation")
def generate_booking_accommodation_tool(
    destination: str,
    checkin_date: str,
    checkout_date: str,
    adults: int = 2,
    rooms: int = 1,
    budget_level: str = "budget"
) -> str:
    """
    Gera hiperligacoes diretas e recomendacoes de alojamento no Booking.com para a cidade e datas indicadas.
    """
    url = generate_booking_url(
        destination=destination,
        checkin_date=checkin_date,
        checkout_date=checkout_date,
        adults=adults,
        rooms=rooms,
        budget_level=budget_level
    )

    return (
        f"Alojamentos para {destination} ({checkin_date} a {checkout_date}, {adults} adultos):\n"
        f"- [Pesquisar Hoteis e Hostels no Booking.com com Filtros Pre-preenchidos]({url})\n"
        f"- Zonas recomendadas: Centro Historico / Proximo de Transportes Publicos."
    )


def get_booking_accommodations_structured(query: BookingSearchQuery) -> BookingSearchResult:
    """
    Devolve objeto BookingSearchResult com URL e recomendacoes mock de zonas/hoteis.
    """
    direct_url = generate_booking_url(
        destination=query.destination,
        checkin_date=query.checkin_date,
        checkout_date=query.checkout_date,
        adults=query.adults,
        rooms=query.rooms,
        budget_level=query.budget_level or "budget"
    )

    dest_lower = query.destination.lower()
    base_hotel_price = 60.0
    if any(expensive in dest_lower for expensive in ["dubai", "nova iorque", "new york", "las vegas", "londres", "london", "paris", "tokyo", "japao", "japan", "suica"]):
        base_hotel_price = 110.0
    elif any(cheap in dest_lower for cheap in ["tailandia", "thailand", "bali", "indonesia", "marrocos", "fez", "marrakech", "india", "vietnam"]):
        base_hotel_price = 30.0
    elif any(med in dest_lower for med in ["roma", "rome", "barcelona", "madrid", "amsterdam", "amsterdao", "atenas", "lisboa", "porto"]):
        base_hotel_price = 70.0

    recommendations = [
        HotelRecommendation(
            name=f"Hotel Economico Centro {dest_clean}",
            area=f"Centro Historico de {dest_clean}",
            estimated_price_per_night=base_hotel_price,
            rating_category="Muito Bom (8.2+)",
            booking_url=direct_url
        ),
        HotelRecommendation(
            name=f"Hostel / Guesthouse Central {dest_clean}",
            area=f"Zona Proxima da Estacao Principal de {dest_clean}",
            estimated_price_per_night=round(base_hotel_price * 0.6, 2),
            rating_category="Economico e Bem Localizado",
            booking_url=direct_url
        )
    ]

    return BookingSearchResult(
        destination=query.destination,
        checkin_date=query.checkin_date,
        checkout_date=query.checkout_date,
        search_url=direct_url,
        recommendations=recommendations
    )
