"""
Modelos Pydantic para as ferramentas de pesquisa de viagens (Voos, Alojamento e Pesquisa Web).
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Schemas para Voos (Kiwi MCP)
# ---------------------------------------------------------------------------

class FlightOption(BaseModel):
    """Representa uma opcao individual de voo."""
    flight_id: str = Field(description="Identificador unico do voo ou rota")
    origin: str = Field(description="Codigo IATA ou cidade de origem")
    destination: str = Field(description="Codigo IATA ou cidade de destino")
    departure_time: str = Field(description="Data e hora de partida estimada (ISO format ou texto)")
    arrival_time: str = Field(description="Data e hora de chegada estimada")
    price: float = Field(description="Preco total por passageiro")
    currency: str = Field(default="EUR", description="Moeda do preco")
    airline: str = Field(description="Companhia aerea principal ou operadora")
    transits: int = Field(default=0, description="Numero de escalas ou conexoes")
    duration: str = Field(description="Duracao estimada do voo (ex: 2h 30m)")
    booking_url: Optional[str] = Field(default=None, description="Ligacao direta para a reserva do voo")


class FlightSearchQuery(BaseModel):
    """Parametros para a pesquisa de voos."""
    origin: str = Field(..., description="Cidade ou codigo IATA de origem (ex: LIS, OPO, Madrid)")
    destination: str = Field(..., description="Cidade ou codigo IATA de destino (ex: PAR, BCN, Rome)")
    date_from: str = Field(..., description="Data de partida (formato YYYY-MM-DD ou DD/MM/YYYY)")
    date_to: Optional[str] = Field(default=None, description="Data de regresso (opcional para ida e volta)")
    passengers: int = Field(default=1, ge=1, description="Numero de passageiros")
    currency: str = Field(default="EUR", description="Moeda pretendida (EUR, USD, GBP)")
    max_price: Optional[float] = Field(default=None, description="Preco maximo pretendido por bilhete")


class FlightSearchResult(BaseModel):
    """Resultado consolidado da pesquisa de voos."""
    status: str = Field(default="success", description="Estado da consulta (success, empty, error)")
    origin: str
    destination: str
    total_found: int = Field(default=0)
    flights: List[FlightOption] = Field(default_factory=list)
    message: Optional[str] = Field(default=None)


# ---------------------------------------------------------------------------
# Schemas para Alojamento (Booking.com Link Generator)
# ---------------------------------------------------------------------------

class HotelRecommendation(BaseModel):
    """Representa uma sugestao de zona ou tipo de hotel no Booking.com."""
    name: str = Field(description="Nome do hotel ou zona recomendada")
    area: str = Field(description="Bairro ou zona da cidade recomendada")
    estimated_price_per_night: float = Field(description="Preco medio estimado por noite")
    rating_category: str = Field(description="Categoria de avaliacao (ex: Muito Bom, Excelente, Economico)")
    booking_url: str = Field(description="Hiperligacao parametrizada para o Booking.com")


class BookingSearchQuery(BaseModel):
    """Parametros para geracao de hiperligacao de alojamento."""
    destination: str = Field(..., description="Cidade e pais de destino (ex: Paris, Franca)")
    checkin_date: str = Field(..., description="Data de entrada (YYYY-MM-DD)")
    checkout_date: str = Field(..., description="Data de saída (YYYY-MM-DD)")
    adults: int = Field(default=2, ge=1, description="Numero de adultos")
    rooms: int = Field(default=1, ge=1, description="Numero de quartos")
    budget_level: Optional[str] = Field(default="budget", description="Nivel de orcamento: budget, moderate, luxury")


class BookingSearchResult(BaseModel):
    """Resultado com hiperligacao parametrizada e recomendacoes."""
    destination: str
    checkin_date: str
    checkout_date: str
    search_url: str = Field(description="Hiperligacao direta com parametros pre-preenchidos")
    recommendations: List[HotelRecommendation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Schemas para Pesquisa Web (Tavily Search)
# ---------------------------------------------------------------------------

class TavilySearchResultItem(BaseModel):
    """Item individual retornado da pesquisa Tavily."""
    title: str
    url: str
    content: str
    score: float = Field(default=0.0)


class TavilySearchQuery(BaseModel):
    """Parametros para pesquisa em tempo real via Tavily."""
    query: str = Field(..., description="Termo de pesquisa (ex: o que fazer em Barcelona 3 dias com pouco dinheiro)")
    search_depth: str = Field(default="basic", description="Profundidade da pesquisa: basic ou advanced")
    max_results: int = Field(default=5, ge=1, le=10, description="Numero maximo de resultados")


class TavilySearchResult(BaseModel):
    """Resultado da pesquisa web Tavily."""
    query: str
    summary: str = Field(description="Resumo extraido e consolidado para consumo por LLM")
    results: List[TavilySearchResultItem] = Field(default_factory=list)
