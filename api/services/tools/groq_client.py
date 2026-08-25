"""
Inicializador e gestor de cliente LLM Groq (Llama 3.2) com Tool Binding.
"""
import logging
from typing import Optional, List, Any
"""
Inicializador e gestor de cliente LLM Groq (Llama 3.2) com Tool Binding.
"""
import logging
from typing import Optional, List, Any
from langchain_groq import ChatGroq
from api.core.config import settings

logger = logging.getLogger(__name__)


def get_groq_llm(model_name: str = "openai/gpt-oss-20b", temperature: float = 0.2):
    """
    Retorna uma instancia configurada de ChatGroq para ser usada pelos agentes.
    Retorna None se GROQ_API_KEY nao estiver presente.
    """
    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        logger.warning("GROQ_API_KEY nao configurada em .env")
        return None
    try:
        return ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=model_name,
            temperature=temperature,
        )
    except Exception as e:
        logger.error(f"Erro ao instanciar ChatGroq: {e}")
        return None


def get_llm_with_tools(tools: List[Any], model_name: str = "openai/gpt-oss-20b"):
    """
    Retorna uma instancia de ChatGroq com ferramentas atreladas (tool calling).
    """
    llm = get_groq_llm(model_name=model_name)
    if llm and hasattr(llm, "bind_tools"):
        return llm.bind_tools(tools)
    return llm
