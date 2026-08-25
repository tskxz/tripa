"use client";

import { useState, useCallback, useRef } from "react";
import {
  ChatStreamStep,
  BudgetSummary,
  ChatStreamDone,
  StreamEventItem,
  FlightItem,
  HotelItem,
} from "@/types/travel";

export interface StreamFilters {
  max_budget?: number;
  travelers?: number;
  direct_flights_only?: boolean;
}

export interface UseChatStreamState {
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  accumulatedText: string;
  steps: ChatStreamStep[];
  friendlyStepMessage: string;
  flights: FlightItem[];
  hotels: HotelItem[];
  budget: BudgetSummary | null;
  eventsLog: StreamEventItem[];
  doneInfo: ChatStreamDone | null;
}

function getFriendlyStepMessage(stepId: string, rawTitle?: string): string {
  switch (stepId) {
    case "parse_intent":
      return "A analisar as tuas preferências de viagem...";
    case "search_flights":
    case "parallel_search":
      return "A procurar as melhores rotas e alojamentos centrais...";
    case "calculate_budget":
      return "A calcular a estimativa e consolidação orçamental...";
    case "generate_response":
      return "A organizar o teu itinerário personalizado...";
    default:
      return rawTitle || "A processar o teu pedido de viagem...";
  }
}

export function useChatStream() {
  const [state, setState] = useState<UseChatStreamState>({
    isLoading: false,
    isStreaming: false,
    error: null,
    accumulatedText: "",
    steps: [],
    friendlyStepMessage: "",
    flights: [],
    hotels: [],
    budget: null,
    eventsLog: [],
    doneInfo: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const stopStream = useCallback(() => {
    if (readerRef.current) {
      try {
        readerRef.current.cancel();
      } catch {
        // Ignorar se ja cancelado
      }
      readerRef.current = null;
    }
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch {
        // Ignorar se ja abortado
      }
      abortControllerRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isLoading: false,
      isStreaming: false,
      friendlyStepMessage: prev.friendlyStepMessage ? "Pesquisa interrompida pelo utilizador." : "",
    }));
  }, []);

  const startStream = useCallback(
    async (
      message: string,
      currency: string = "EUR",
      filters?: StreamFilters
    ) => {
      if (!message.trim()) return;

      stopStream();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState({
        isLoading: true,
        isStreaming: true,
        error: null,
        accumulatedText: "",
        steps: [],
        friendlyStepMessage: "A iniciar a pesquisa de viagem...",
        flights: [],
        hotels: [],
        budget: null,
        eventsLog: [],
        doneInfo: null,
      });

      try {
        const response = await fetch("/api/v1/chat/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            message,
            currency,
            filters: {
              max_budget: filters?.max_budget || undefined,
              travelers: filters?.travelers || 1,
              direct_flights_only: filters?.direct_flights_only || false,
            },
          }),
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error(`Serviço temporariamente indisponível (Código ${response.status})`);
        }

        if (!response.body) {
          throw new Error("Não foi possível iniciar a receção de dados.");
        }

        const reader = response.body.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          if (controller.signal.aborted) break;

          const { value, done } = await reader.read();
          if (done || controller.signal.aborted) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "message";

          for (let i = 0; i < lines.length; i++) {
            if (controller.signal.aborted) break;

            const line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith("event:")) {
              currentEvent = line.substring(6).trim();
              continue;
            }

            if (line.startsWith("data:")) {
              const dataStr = line.substring(5).trim();
              try {
                const parsedData = JSON.parse(dataStr);
                const eventId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

                setState((prev) => {
                  if (controller.signal.aborted) return prev;

                  const newLog: StreamEventItem = {
                    id: eventId,
                    type: currentEvent as any,
                    timestamp: new Date().toLocaleTimeString("pt-PT"),
                    payload: parsedData,
                  };

                  let updatedText = prev.accumulatedText;
                  let updatedSteps = [...prev.steps];
                  let updatedFriendlyMsg = prev.friendlyStepMessage;
                  let updatedFlights = prev.flights;
                  let updatedHotels = prev.hotels;
                  let updatedBudget = prev.budget;
                  let updatedDone = prev.doneInfo;

                  if (currentEvent === "step") {
                    const existingIndex = updatedSteps.findIndex(
                      (s) => s.step_id === parsedData.step_id
                    );
                    if (existingIndex >= 0) {
                      updatedSteps[existingIndex] = parsedData;
                    } else {
                      updatedSteps.push(parsedData);
                    }
                    updatedFriendlyMsg = getFriendlyStepMessage(
                      parsedData.step_id,
                      parsedData.title
                    );
                  } else if (currentEvent === "flight_results") {
                    if (parsedData.flights && Array.isArray(parsedData.flights)) {
                      updatedFlights = parsedData.flights;
                    }
                  } else if (currentEvent === "hotel_results") {
                    if (parsedData.hotels && Array.isArray(parsedData.hotels)) {
                      updatedHotels = parsedData.hotels;
                    }
                  } else if (currentEvent === "message_delta") {
                    if (parsedData.content) {
                      updatedText += parsedData.content;
                    }
                  } else if (currentEvent === "budget_summary") {
                    updatedBudget = parsedData;
                  } else if (currentEvent === "done") {
                    updatedDone = parsedData;
                    updatedFriendlyMsg = "Pesquisa concluída com sucesso";
                  }

                  return {
                    ...prev,
                    isLoading: false,
                    accumulatedText: updatedText,
                    steps: updatedSteps,
                    friendlyStepMessage: updatedFriendlyMsg,
                    flights: updatedFlights,
                    hotels: updatedHotels,
                    budget: updatedBudget,
                    doneInfo: updatedDone,
                    eventsLog: [newLog, ...prev.eventsLog],
                  };
                });
              } catch {
                // Falha de parsing pontual
              }
            }
          }
        }

        readerRef.current = null;

        if (!controller.signal.aborted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            isStreaming: false,
          }));
        }
      } catch (err: any) {
        readerRef.current = null;
        if (controller.signal.aborted || err.name === "AbortError" || err.name === "DOMException") {
          return;
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isStreaming: false,
          error: err.message || "Ocorreu um erro ao obter os dados da viagem.",
        }));
      }
    },
    [stopStream]
  );

  return {
    ...state,
    startStream,
    stopStream,
  };
}
