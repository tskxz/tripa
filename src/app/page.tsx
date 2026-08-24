"use client";

import { useState } from "react";
import {
  Compass,
  Search,
  Square,
  Loader2,
  SlidersHorizontal,
  Users,
  Wallet,
  Sparkles,
  Plane,
  Building2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { useChatStream } from "@/hooks/useChatStream";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { FlightCard } from "@/components/FlightCard";
import { HotelCard } from "@/components/HotelCard";
import { BudgetSummaryCard } from "@/components/BudgetSummaryCard";

export default function HomePage() {
  const [promptMessage, setPromptMessage] = useState(
    "Pretendo 4 dias de férias em Barcelona com partida do Porto em Novembro, alojamento económico e foco em tapas e museus."
  );
  const [showFilters, setShowFilters] = useState(false);
  const [maxBudget, setMaxBudget] = useState<string>("");
  const [travelers, setTravelers] = useState<number>(1);

  const {
    isLoading,
    isStreaming,
    error: streamError,
    accumulatedText,
    friendlyStepMessage,
    flights,
    hotels,
    budget,
    startStream,
    stopStream,
  } = useChatStream();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptMessage.trim() || isStreaming) return;

    const parsedBudget = maxBudget ? parseFloat(maxBudget) : undefined;
    startStream(promptMessage, "EUR", {
      max_budget: parsedBudget,
      travelers: travelers,
      direct_flights_only: false,
    });
  };

  const handleQuickPrompt = (text: string) => {
    setPromptMessage(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      {/* Cabeçalho Minimalista Superior */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-sky-900 border border-sky-700 flex items-center justify-center text-sky-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-slate-100">
                  Tripa
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-800 text-sky-400 border border-slate-700">
                  Assistente de Viagens
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pesquisa e Planeamento Personalizado
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-400 hidden sm:inline">Serviço Disponível</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Secção Central de Pesquisa */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-950 border border-slate-800 text-sky-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Planeia a tua próxima viagem em linguagem natural</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              O teu itinerário perfeito em segundos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Indica para onde queres ir, a duração da estadia e o teu orçamento.
              Procuramos os melhores voos, alojamentos e roteiros por ti.
            </p>
          </div>

          {/* Formulário de Pesquisa */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                O que estás a planear?
              </label>
              <div className="relative">
                <textarea
                  value={promptMessage}
                  onChange={(e) => setPromptMessage(e.target.value)}
                  rows={3}
                  placeholder="Ex: 4 dias em Barcelona em Novembro com alojamento central e orçamento até 400 euros..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors custom-scrollbar"
                />
              </div>
            </div>

            {/* Sugestões Rápidas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Exemplos:</span>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "4 dias em Barcelona a partir do Porto em Novembro com foco em tapas e museus."
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors"
              >
                Barcelona (4 dias)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "Fim de semana económico em Roma com partida de Lisboa com voos diretos e foco em história."
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors"
              >
                Roma (Fim de semana)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "3 dias em Paris para 2 pessoas com alojamento central em zona tranquila."
                  )
                }
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-sky-400 border border-slate-800 transition-colors"
              >
                Paris (3 dias)
              </button>
            </div>

            {/* Painel de Filtros Opcionais */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
                <span>{showFilters ? "Ocultar Filtros" : "Filtros Opcionais (Orçamento e Viajantes)"}</span>
              </button>

              {showFilters && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-medium flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-slate-400" />
                      <span>Orçamento Máximo (EUR)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 500"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-medium flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Número de Viajantes</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={travelers}
                      onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ações de Submissão */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-800">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStream}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 font-medium text-xs transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Interromper Pesquisa</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!promptMessage.trim() || isLoading}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs transition-colors disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  <span>Pesquisar Viagem</span>
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Indicador de Progresso Amigável */}
        {(isLoading || isStreaming) && (
          <section className="rounded-xl border border-sky-900/60 bg-sky-950/40 p-4 flex items-center space-x-3 text-xs text-sky-200">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-sky-300">
                {friendlyStepMessage || "A processar a pesquisa..."}
              </p>
              <p className="text-[11px] text-sky-400/80">
                A analisar rotas, disponibilidade de alojamento e recomendações locais.
              </p>
            </div>
          </section>
        )}

        {/* Erro de Processamento */}
        {streamError && (
          <section className="rounded-xl border border-red-900 bg-red-950/50 p-4 flex items-start space-x-3 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Não foi possível concluir a pesquisa</p>
              <p className="text-red-400/90 text-[11px] mt-0.5">{streamError}</p>
            </div>
          </section>
        )}

        {/* Área de Resultados da Viagem */}
        {(accumulatedText || flights.length > 0 || hotels.length > 0 || budget) && (
          <div className="space-y-8">
            {/* Grelha de Cartões Visuais (Voos e Alojamento) */}
            {(flights.length > 0 || hotels.length > 0) && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Opções Recomendadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} />
                  ))}
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              </div>
            )}

            {/* Cartão de Resumo Orçamental */}
            {budget && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Previsão Financeira
                </h2>
                <BudgetSummaryCard budget={budget} />
              </div>
            )}

            {/* Painel com Itinerário Detalhado em Markdown */}
            {accumulatedText && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Itinerário e Recomendações Detalhadas
                  </h2>
                  {isStreaming && (
                    <span className="text-[11px] text-sky-400 font-medium">
                      A organizar resposta...
                    </span>
                  )}
                </div>

                <MarkdownRenderer content={accumulatedText} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rodapé Minimalista */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Tripa AI &bull; Planeamento Inteligente de Viagens</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Pesquisa de Voos & Alojamento</span>
            <span>Itinerários Personalizados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
