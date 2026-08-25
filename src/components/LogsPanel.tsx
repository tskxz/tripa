"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, X, RefreshCw, Trash2, ChevronDown } from "lucide-react";

interface LogEntry {
  ts: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  logger: string;
  msg: string;
}

interface LogsResponse {
  total: number;
  entries: LogEntry[];
}

const LEVEL_STYLES: Record<string, string> = {
  DEBUG: "text-neutral-400 dark:text-neutral-500",
  INFO: "text-blue-600 dark:text-blue-400",
  WARNING: "text-amber-600 dark:text-amber-400 font-medium",
  ERROR: "text-red-600 dark:text-red-400 font-semibold",
  CRITICAL: "text-red-700 dark:text-red-300 font-bold",
};

const LEVEL_BADGE: Record<string, string> = {
  DEBUG: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400",
  INFO: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
  WARNING: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300",
  ERROR: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300",
  CRITICAL: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function LogsPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [lastFetchCount, setLastFetchCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "150" });
      if (filterLevel !== "ALL") params.set("level", filterLevel);
      const res = await fetch(`/api/v1/logs?${params.toString()}`);
      if (res.ok) {
        const data: LogsResponse = await res.json();
        setLogs(data.entries);
        setLastFetchCount(data.total);
      }
    } catch {
      // silenciar erro de rede
    } finally {
      setLoading(false);
    }
  }, [filterLevel]);

  const clearLogs = async () => {
    await fetch("/api/v1/logs", { method: "DELETE" });
    setLogs([]);
    setLastFetchCount(0);
  };

  // Auto-scroll ao fim quando chegam logs novos
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, open]);

  // Fetch inicial ao abrir
  useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  // Auto-refresh a cada 3s
  useEffect(() => {
    if (autoRefresh && open) {
      intervalRef.current = setInterval(fetchLogs, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, open, fetchLogs]);

  // Re-fetch ao mudar filtro
  useEffect(() => {
    if (open) fetchLogs();
  }, [filterLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredLogs = filterLevel === "ALL"
    ? logs
    : logs.filter((l) => l.level === filterLevel);

  // Detetar se o ponto 3 foi LLM ou fallback nas ultimas entradas
  const lastTipsSource = (() => {
    const reversed = [...logs].reverse();
    for (const entry of reversed) {
      if (entry.msg.includes("LLM tips raw response")) return "llm";
      if (entry.msg.includes("nao devolveu lista formatada") || entry.msg.includes("fallback")) return "fallback";
      if (entry.msg.includes("Geracao de dicas com LLM falhou")) return "fallback";
    }
    return null;
  })();

  return (
    <>
      {/* Botao flutuante */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Ver logs do agente"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-black dark:hover:text-white transition-colors shadow-sm text-xs font-mono"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>logs</span>
        {lastTipsSource && (
          <span
            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold ${
              lastTipsSource === "llm"
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
            }`}
          >
            P3: {lastTipsSource === "llm" ? "LLM" : "fallback"}
          </span>
        )}
      </button>

      {/* Painel deslizante */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col pointer-events-none">
          {/* Overlay escuro */}
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/50 pointer-events-auto"
            onClick={() => setOpen(false)}
          />

          {/* Painel inferior */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto flex flex-col bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 rounded-t-xl shadow-2xl"
            style={{ height: "55vh", maxHeight: "600px" }}
          >
            {/* Header do painel */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <Terminal className="w-4 h-4 text-neutral-500" />
              <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex-1">
                Logs do Agente Tripa
                <span className="ml-2 text-neutral-400 font-normal">({lastFetchCount} entradas)</span>
              </span>

              {/* Badge fonte do ponto 3 */}
              {lastTipsSource && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    lastTipsSource === "llm"
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  Ponto 3: {lastTipsSource === "llm" ? "gerado pelo LLM" : "fallback curado"}
                </span>
              )}

              {/* Filtro de nível */}
              <div className="relative flex items-center">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="appearance-none pl-2 pr-6 py-1 text-[11px] rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-mono focus:outline-none"
                >
                  <option value="ALL">TODOS</option>
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <ChevronDown className="absolute right-1.5 w-3 h-3 text-neutral-400 pointer-events-none" />
              </div>

              {/* Auto-refresh toggle */}
              <button
                type="button"
                onClick={() => setAutoRefresh((v) => !v)}
                className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                  autoRefresh
                    ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                    : "border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
                title="Auto-refresh a cada 3s"
              >
                live
              </button>

              <button
                type="button"
                onClick={fetchLogs}
                disabled={loading}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors disabled:opacity-40"
                title="Atualizar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>

              <button
                type="button"
                onClick={clearLogs}
                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Limpar logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lista de logs */}
            <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed p-2 space-y-0.5">
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-neutral-400 dark:text-neutral-600 text-xs">
                  {loading ? "A carregar logs..." : "Nenhum log disponivel. Faz uma pesquisa primeiro."}
                </div>
              ) : (
                filteredLogs.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start px-1 py-0.5 rounded hover:bg-neutral-50 dark:hover:bg-neutral-900 group"
                  >
                    {/* Timestamp */}
                    <span className="shrink-0 text-neutral-400 dark:text-neutral-600 w-20">
                      {formatTime(entry.ts)}
                    </span>

                    {/* Badge de nivel */}
                    <span
                      className={`shrink-0 px-1.5 py-px rounded text-[10px] font-semibold ${LEVEL_BADGE[entry.level] ?? ""}`}
                    >
                      {entry.level}
                    </span>

                    {/* Mensagem */}
                    <span className={`break-all ${LEVEL_STYLES[entry.level] ?? "text-neutral-700 dark:text-neutral-300"}`}>
                      {entry.msg}
                    </span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
