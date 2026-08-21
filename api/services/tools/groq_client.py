"""
Inicializador e gestor de cliente LLM Groq (Llama 3.2) com Tool Binding.
"""
import logging
from typing import Optional, List, Any
from api.core.config import settings

logger = logging.getLogger(__name__)


def get_groq_llm(model_name: str = "llama-3.2-11b-vision-preview", temperature: float = 0.2):
    """
    Inicializa o modelo ChatGroq utilizando a chave GROQ_API_KEY configurada.
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        logger.warning("GROQ_API_KEY nao foi encontrada no ficheiro .env. Algumas operacoes de inferencia em tempo real podem requerer esta chave.")
    
    try:
        from langchain_groq import ChatGroq
        return ChatGroq(
            groq_api_key=api_key or "gsk_dummy_key_for_initialization",
            model_name=model_name,
            temperature=temperature
        )
    except Exception as e:
        logger.error(f"Erro ao inicializar o ChatGroq: {e}")
        return None


def get_llm_with_tools(tools: List[Any], model_name: str = "llama-3.2-11b-vision-preview"):
    """
    Devolve a instancia do ChatGroq associada as ferramentas (Tool Binding).
    """
    llm = get_groq_llm(model_name=model_name)
    if llm and hasattr(llm, "bind_tools"):
        return llm.bind_tools(tools)
    return llm
