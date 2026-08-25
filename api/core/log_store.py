"""
LogStore: buffer circular em memoria para logs do agente Tripa.
Exposto via endpoint /api/v1/logs para debug em tempo real.
"""
import logging
import threading
from collections import deque
from datetime import datetime, timezone
from typing import Deque, Dict, Any, List


# ---------------------------------------------------------------------------
# Buffer global (circular, max 200 entradas)
# ---------------------------------------------------------------------------
_MAX_ENTRIES = 200
_lock = threading.Lock()
_log_buffer: Deque[Dict[str, Any]] = deque(maxlen=_MAX_ENTRIES)


def add_log_entry(level: str, logger_name: str, message: str) -> None:
    """Adiciona uma entrada ao buffer de logs."""
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "logger": logger_name,
        "msg": message,
    }
    with _lock:
        _log_buffer.append(entry)


def get_log_entries(limit: int = 100) -> List[Dict[str, Any]]:
    """Devolve as ultimas `limit` entradas do buffer (mais recentes no fim)."""
    with _lock:
        entries = list(_log_buffer)
    return entries[-limit:]


def clear_logs() -> None:
    """Limpa o buffer de logs."""
    with _lock:
        _log_buffer.clear()


# ---------------------------------------------------------------------------
# Handler de logging que alimenta o buffer
# ---------------------------------------------------------------------------
class MemoryLogHandler(logging.Handler):
    """
    Handler que intercepta mensagens de log e as guarda no buffer em memoria.
    Registar nos loggers desejados em startup.
    """

    LEVEL_MAP = {
        logging.DEBUG: "DEBUG",
        logging.INFO: "INFO",
        logging.WARNING: "WARNING",
        logging.ERROR: "ERROR",
        logging.CRITICAL: "CRITICAL",
    }

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = self.LEVEL_MAP.get(record.levelno, "INFO")
            msg = self.format(record)
            add_log_entry(level=level, logger_name=record.name, message=msg)
        except Exception:
            self.handleError(record)


# ---------------------------------------------------------------------------
# Instalar o handler nos loggers relevantes
# ---------------------------------------------------------------------------
_installed = False


def install_memory_handler() -> None:
    """
    Instala o MemoryLogHandler nos loggers do agente.
    Deve ser chamado uma vez no startup da aplicacao.
    """
    global _installed
    if _installed:
        return
    _installed = True

    handler = MemoryLogHandler()
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter("%(message)s")
    handler.setFormatter(formatter)

    # Loggers a capturar
    target_loggers = [
        "api.services.agents.graph",
        "api.services.tools.tavily",
        "api.services.tools.groq_client",
    ]
    for name in target_loggers:
        lg = logging.getLogger(name)
        lg.setLevel(logging.DEBUG)
        # Evitar duplicados
        if not any(isinstance(h, MemoryLogHandler) for h in lg.handlers):
            lg.addHandler(handler)
