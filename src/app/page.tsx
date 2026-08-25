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
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col justify-between font-sans">
      {/* Cabeçalho Minimalista Superior */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">
                Tripa
              </span>
              <p className="text-[10px] text-neutral-400">
                Pesquisa e Planeamento de Viagens
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Secção Central de Pesquisa */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 sm:p-7 space-y-5">
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Planeia a tua viagem
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Indica o destino, a duração e o orçamento. Obtém rotas, voos e alojamentos.
            </p>
          </div>

          {/* Formulário de Pesquisa */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-300">
                O que estás a planear?
              </label>
              <div className="relative">
                <textarea
                  value={promptMessage}
                  onChange={(e) => setPromptMessage(e.target.value)}
                  rows={3}
                  placeholder="Ex: 4 dias em Barcelona em Novembro com alojamento central e orçamento até 400 euros..."
                  className="w-full rounded-lg bg-black border border-neutral-800 p-3.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors custom-scrollbar"
                />
              </div>
            </div>

            {/* Sugestões Rápidas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-neutral-500 font-medium">Exemplos:</span>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    "4 dias em Barcelona a partir do Porto em Novembro com foco em tapas e museus."
                  )
                }
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
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
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
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
                className="text-xs px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
              >
                Paris (3 dias)
              </button>
            </div>

            {/* Painel de Filtros Opcionais */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center space-x-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <span>{showFilters ? "Ocultar Filtros" : "Filtros Opcionais (Orçamento e Viajantes)"}</span>
              </button>

              {showFilters && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-black border border-neutral-800 text-xs">
                  <div className="space-y-1">
                    <label className="block text-neutral-300 font-medium flex items-center space-x-1.5">
                      <Wallet className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Orçamento Máximo (EUR)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 500"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full rounded bg-neutral-900 border border-neutral-800 p-2 text-white placeholder-neutral-600 focus:outline-none focus:border-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-neutral-300 font-medium flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Número de Viajantes</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={travelers}
                      onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded bg-neutral-900 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ações de Submissão */}
            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-neutral-800">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStream}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-medium text-xs transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Interromper Pesquisa</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!promptMessage.trim() || isLoading}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-semibold text-xs transition-colors disabled:cursor-not-allowed"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Pesquisar Viagem</span>
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Indicador de Progresso Amigável */}
        {(isLoading || isStreaming) && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 flex items-center space-x-3 text-xs text-neutral-300">
            <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold text-white">
                {friendlyStepMessage || "A processar a pesquisa..."}
              </p>
              <p className="text-[11px] text-neutral-400">
                A analisar rotas, disponibilidade de alojamento e recomendações locais.
              </p>
            </div>
          </section>
        )}

        {/* Erro de Processamento */}
        {streamError && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-950 p-3.5 flex items-start space-x-3 text-xs text-neutral-200">
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Não foi possível concluir a pesquisa</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">{streamError}</p>
            </div>
          </section>
        )}

        {/* Área de Resultados da Viagem */}
        {(accumulatedText || flights.length > 0 || hotels.length > 0 || budget) && (
          <div className="space-y-6">
            {/* Grelha de Cartões Visuais (Voos e Alojamento) */}
            {(flights.length > 0 || hotels.length > 0) && (
              <div className="space-y-2.5">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Opções Recomendadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
              <div className="space-y-2.5">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Previsão Financeira
                </h2>
                <BudgetSummaryCard budget={budget} />
              </div>
            )}

            {/* Painel com Itinerário Detalhado em Markdown */}
            {accumulatedText && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Itinerário e Recomendações
                  </h2>
                  {isStreaming && (
                    <span className="text-[11px] text-neutral-400 font-medium">
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
      <footer className="border-t border-neutral-800 bg-neutral-950 py-5 mt-10 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span>Tripa &bull; Planeamento de Viagens</span>
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
