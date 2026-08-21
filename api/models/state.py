"""
Esquema de estado compartilhado (State) do agente LangGraph do Tripa AI.
"""
from typing import TypedDict, Optional, List, Dict, Any


class TripaAgentState(TypedDict, total=False):
    """
    Estado dinamico passado entre os nos do grafo de decisao do LangGraph.
    """
    # Dados brutos do pedido do utilizador
    user_query: str
    currency: str
    filters: Dict[str, Any]
    conversation_id: str

    # Entidades extraidas (ParseUserIntentNode)
    origin: str
    destination: str
    date_from: str
    date_to: Optional[str]
    duration_days: int
    passengers: int
    max_budget: Optional[float]
    travel_style: str

    # Resultados de pesquisas paralelas (ParallelSearchNode)
    flight_options: List[Dict[str, Any]]
    hotel_options: List[Dict[str, Any]]
    tavily_summary: str
    tavily_results: List[Dict[str, Any]]

    # Calculo orcamental consolidado (BudgetConsolidationNode)
    budget_summary: Dict[str, Any]

    # Historico de passos e resposta gerada
    messages: List[Any]
    current_step: str
    status_steps: List[Dict[str, Any]]
    final_response_text: str
    error: Optional[str]
