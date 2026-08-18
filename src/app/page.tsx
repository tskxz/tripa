"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Server,
  Zap,
  Send,
  Square,
  RefreshCw,
  Terminal,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Sparkles,
} from "lucide-react";
import { HealthCheckResponse } from "@/types/travel";
import { useChatStream } from "@/hooks/useChatStream";

export default function HomePage() {
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [promptMessage, setPromptMessage] = useState(
    "Pretendo 4 dias de ferias em Barcelona com partida do Porto em Novembro, alojamento economico e foco em tapas e museus."
  );

  const {
    isLoading,
    isStreaming,
    error: streamError,
    accumulatedText,
    steps,
    budget,
    eventsLog,
    doneInfo,
    startStream,
    stopStream,
  } = useChatStream();

  const fetchHealthStatus = async () => {
    setIsCheckingHealth(true);
    setHealthError(null);
    try {
      const res = await fetch("/api/v1/health");
      if (!res.ok) {
        throw new Error(`Falha no contacto com o backend (HTTP ${res.status})`);
      }
      const data: HealthCheckResponse = await res.json();
      setHealthData(data);
    } catch (err: any) {
      setHealthError(
        err.message || "Nao foi possivel estabelecer ligacao ao endpoint /api/v1/health"
      );
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptMessage.trim() || isStreaming) return;
    startStream(promptMessage);
  };

  const handleQuickPrompt = (text: string) => {
    setPromptMessage(text);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-between">
      {/* Barra de Navegacao Superior */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <CompassIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-400">
                  Tripa AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  Infraestrutura Base
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Assistente de Viagens e Ferias Economicas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FastAPI Python + Next.js App Router</span>
            </div>
            <button
              onClick={fetchHealthStatus}
              disabled={isCheckingHealth}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition active:scale-95 text-xs"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin text-sky-400" : ""}`}
              />
              <span>Atualizar Estado</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteudo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Painel Informativo Superior */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 sm:p-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Validacao de Infraestrutura e Comunicacao Unificada</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ambiente Integrado FastAPI & Next.js
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
              Esta demonstracao valida o funcionamento da infraestrutura
              preparada para deploy unificado na Vercel, incluindo verificacao
              de diagnostico do servidor Python e transmissao de eventos em
              tempo real via Server-Sent Events (SSE).
            </p>
          </div>
        </section>

        {/* Grade com Diagnostico e Teste de Streaming */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Estado do Backend (FastAPI Health) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Estado do Backend (FastAPI)
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  /api/v1/health
                </span>
              </div>

              {isCheckingHealth && !healthData && (
                <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                  <span>A consultar endpoint de diagnostico...</span>
                </div>
              )}

              {healthError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Falha de Comunicacao</p>
                    <p className="text-[11px] text-red-400/90">{healthError}</p>
                  </div>
                </div>
              )}

              {healthData && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400">Estado Global</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {healthData.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Servicos e Conectores
                    </p>
                    <div className="space-y-1.5">
                      {Object.entries(healthData.services).map(
                        ([serviceName, status]) => (
                          <div
                            key={serviceName}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/80"
                          >
                            <span className="font-mono text-slate-300">
                              {serviceName}
                            </span>
                            <span
                              className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded ${
                                status === "connected" || status === "available"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              }`}
                            >
                              {status}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[11px] text-slate-400">
                    <span>Versao da API</span>
                    <span className="font-mono text-slate-200">
                      v{healthData.version}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Informacoes de Arquitetura */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/40 p-5 space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Especificacoes do Ambiente</span>
              </div>
              <ul className="space-y-2 list-disc list-inside text-[11px] text-slate-300">
                <li>FastAPI 0.115+ com Pydantic v2</li>
                <li>Next.js 15/16 App Router com React 19</li>
                <li>Roteamento Vercel via vercel.json</li>
                <li>Transmissao em tempo real com SSE</li>
              </ul>
            </div>
          </div>

          {/* Coluna Direita: Teste de Streaming SSE (/api/v1/chat/stream) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-sky-400" />
                  <h2 className="text-sm font-semibold text-white">
                    Teste de Streaming SSE em Tempo Real
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  /api/v1/chat/stream
                </span>
              </div>

              {/* Formulario de Envio */}
              <form onSubmit={handleSendPrompt} className="space-y-3">
                <label className="block text-xs font-medium text-slate-300">
                  Indicacoes de Viagem (Prompt do Utilizador)
                </label>
                <div className="relative">
                  <textarea
                    value={promptMessage}
                    onChange={(e) => setPromptMessage(e.target.value)}
                    rows={3}
                    placeholder="Indique o destino, datas e restricoes orcamentais..."
                    className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition custom-scrollbar"
                  />
                </div>

                {/* Sugestoes Rapidas */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Exemplos:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPrompt(
                        "4 dias em Barcelona a partir do Porto em Novembro com foco em tapas e museus."
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-slate-700/60 transition"
                  >
                    Barcelona (4 dias)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPrompt(
                        "Fim de semana economico em Roma com partida de Lisboa com voos diretos e foco em historia."
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-slate-700/60 transition"
                  >
                    Roma (Fim de semana)
                  </button>
                </div>

                {/* Botoes de Acao */}
                <div className="flex items-center justify-end space-x-3 pt-2">
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={stopStream}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition text-xs font-semibold"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Interromper Streaming</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!promptMessage.trim() || isLoading}
                      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Pedido SSE</span>
                    </button>
                  )}
                </div>
              </form>

              {/* Erro de Streaming */}
              {streamError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p>{streamError}</p>
                </div>
              )}

              {/* Visualizacao dos Passos do Agente (SSE Steps) */}
              {steps.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Etapas de Processamento (Eventos SSE: step)
                  </p>
                  <div className="space-y-1.5">
                    {steps.map((step, idx) => (
                      <div
                        key={step.step_id || idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                          <span className="text-slate-200">{step.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          {step.step_id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualizacao do Texto em Streaming */}
              {(accumulatedText || isStreaming) && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Resposta em Streaming (Eventos SSE: message_delta)
                    </p>
                    {isStreaming && (
                      <span className="text-[10px] text-sky-400 font-medium animate-pulse">
                        A transmitir dados...
                      </span>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans min-h-[70px]">
                    {accumulatedText}
                    {isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-sky-400 animate-pulse align-middle" />
                    )}
                  </div>
                </div>
              )}

              {/* Resumo Orcamental Demonstrativo (SSE budget_summary) */}
              {budget && (
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Consolidacao Orcamental (Evento SSE: budget_summary)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Voos</span>
                      <span className="text-xs font-bold text-slate-200">
                        {budget.flights_cost.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Alojamento</span>
                      <span className="text-xs font-bold text-slate-200">
                        {budget.hotel_cost.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Alimentacao/Transp.</span>
                      <span className="text-xs font-bold text-slate-200">
                        {budget.daily_food_and_transport.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                      <span className="text-[10px] text-emerald-400 block">Total Previsto</span>
                      <span className="text-xs font-bold text-emerald-300">
                        {budget.total_estimated.toFixed(2)} {budget.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Registo de Eventos Brutos SSE (Event Inspector) */}
              {eventsLog.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Registo de Eventos SSE ({eventsLog.length})
                      </p>
                    </div>
                    {doneInfo && (
                      <span className="text-[10px] text-emerald-400 font-mono">
                        Concluido ({doneInfo.status})
                      </span>
                    )}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-slate-950 border border-slate-800/90 font-mono text-[10px] text-slate-300 custom-scrollbar">
                    {eventsLog.map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-start space-x-2 py-0.5 border-b border-slate-900/80 last:border-0"
                      >
                        <span className="text-slate-500 shrink-0">
                          [{evt.timestamp}]
                        </span>
                        <span className="text-sky-400 font-semibold shrink-0">
                          event: {evt.type}
                        </span>
                        <span className="text-slate-400 truncate">
                          {JSON.stringify(evt.payload)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Rodape Tecnico */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Tripa AI &bull; Infraestrutura Base de Planeamento de Ferias</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>FastAPI Serverless (@vercel/python)</span>
            <span>Next.js 15/16 App Router</span>
            <span>SSE Streaming</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
