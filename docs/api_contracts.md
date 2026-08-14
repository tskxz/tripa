# Especificacoes de Contratos de API e Schemas (Tripa AI)

Este documento define os schemas e contratos de comunicacao entre o cliente **Next.js** e o servidor **FastAPI**, bem como os formatos de dados internos dos nos do **LangGraph** e ferramentas **MCP**.

---

## 1. Endpoints do Backend (FastAPI)

### 1.1. Health Check
- **Rota**: `GET /api/v1/health`
- **Descricao**: Valida se o backend e os servicos dependentes (Groq API, Servidores MCP) estao operacionais.
- **Resposta**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "services": {
    "llm_groq": "connected",
    "mcp_kiwi": "available",
    "mcp_tavily": "available"
  },
  "timestamp": "2026-08-14T17:40:00Z"
}
```

---

### 1.2. Chat / Planeamento de Viagem com Streaming (SSE)
- **Rota**: `POST /api/v1/chat/stream`
- **Content-Type**: `application/json`
- **Response**: `text/event-stream`

#### Carga Util da Requisicao (Request Payload):
```json
{
  "message": "Pretendo 4 dias de ferias em Barcelona com partida do Porto em Novembro, alojamento economico e foco em tapas e museus.",
  "conversation_id": "uuid-v4-opcional",
  "currency": "EUR",
  "filters": {
    "max_budget": 450.0,
    "travelers": 1,
    "direct_flights_only": false
  }
}
```

#### Eventos de Streaming SSE emitidos:
```
event: step
data: {"step_id": "parse_intent", "title": "A analisar o pedido", "status": "running"}

event: step
data: {"step_id": "search_flights", "title": "A pesquisar voos Porto -> Barcelona no Kiwi", "status": "running"}

event: flight_results
data: {
  "flights": [
    {
      "id": "fl_1",
      "airline": "Ryanair",
      "flight_number": "FR4521",
      "departure": {"airport": "OPO", "time": "2026-11-12T06:30:00"},
      "arrival": {"airport": "BCN", "time": "2026-11-12T09:15:00"},
      "price": 42.50,
      "currency": "EUR",
      "booking_url": "https://kiwi.com/..."
    }
  ]
}

event: hotel_results
data: {
  "hotels": [
    {
      "id": "ht_1",
      "name": "Hostel One Ramblas",
      "neighborhood": "Gothic Quarter",
      "rating": 8.9,
      "price_per_night": 35.0,
      "total_price": 105.0,
      "currency": "EUR",
      "booking_url": "https://booking.com/searchresults.html?..."
    }
  ]
}

event: message_delta
data: {"content": "Estruturei um roteiro completo de 4 dias focado na rota gastronomica do bairro El Born e visitas culturais..."}

event: budget_summary
data: {
  "flights_cost": 85.0,
  "hotel_cost": 105.0,
  "daily_food_and_transport": 160.0,
  "activities_cost": 40.0,
  "emergency_buffer": 39.0,
  "total_estimated": 429.0,
  "currency": "EUR",
  "is_under_budget": true
}

event: done
data: {"status": "success", "conversation_id": "conv-uuid-123"}
```

---

## 2. Tipos e Schemas (Pydantic / TypeScript)

### Definicoes TypeScript (Frontend)
```typescript
export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { airport: string; time: string };
  arrival: { airport: string; time: string };
  durationMinutes: number;
  stops: number;
  price: number;
  currency: string;
  bookingUrl: string;
}

export interface HotelOption {
  id: string;
  name: string;
  neighborhood: string;
  rating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  bookingUrl: string;
  photoUrl?: string;
}

export interface ItineraryItem {
  timeSlot: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  estimatedCost: number;
  location?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  theme: string;
  items: ItineraryItem[];
}

export interface BudgetSummary {
  flightsCost: number;
  hotelCost: number;
  dailyFoodAndTransport: number;
  activitiesCost: number;
  emergencyBuffer: number;
  totalEstimated: number;
  currency: string;
  isUnderBudget: boolean;
}
```
