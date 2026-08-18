"use client";

import { useState, useCallback, useRef } from "react";
import {
  ChatStreamStep,
  BudgetSummary,
  ChatStreamDone,
  StreamEventItem,
} from "@/types/travel";

export interface UseChatStreamState {
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  accumulatedText: string;
  steps: ChatStreamStep[];
  budget: BudgetSummary | null;
  eventsLog: StreamEventItem[];
  doneInfo: ChatStreamDone | null;
}

export function useChatStream() {
  const [state, setState] = useState<UseChatStreamState>({
    isLoading: false,
    isStreaming: false,
    error: null,
    accumulatedText: "",
    steps: [],
    budget: null,
    eventsLog: [],
    doneInfo: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async (message: string, currency: string = "EUR") => {
    if (!message.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState({
      isLoading: true,
      isStreaming: true,
      error: null,
      accumulatedText: "",
      steps: [],
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
            travelers: 1,
            direct_flights_only: false,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor (Codigo ${response.status})`);
      }

      if (!response.body) {
        throw new Error("O corpo da resposta de streaming nao esta disponivel");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "message";

        for (let i = 0; i < lines.length; i++) {
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
                const newLog: StreamEventItem = {
                  id: eventId,
                  type: currentEvent as any,
                  timestamp: new Date().toLocaleTimeString("pt-PT"),
                  payload: parsedData,
                };

                let updatedText = prev.accumulatedText;
                let updatedSteps = [...prev.steps];
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
                } else if (currentEvent === "message_delta") {
                  if (parsedData.content) {
                    updatedText += parsedData.content;
                  }
                } else if (currentEvent === "budget_summary") {
                  updatedBudget = parsedData;
                } else if (currentEvent === "done") {
                  updatedDone = parsedData;
                }

                return {
                  ...prev,
                  isLoading: false,
                  accumulatedText: updatedText,
                  steps: updatedSteps,
                  budget: updatedBudget,
                  doneInfo: updatedDone,
                  eventsLog: [newLog, ...prev.eventsLog],
                };
              });
            } catch {
              // Em caso de falha de parsing do JSON
            }
          }
        }
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
      }));
    } catch (err: any) {
      if (err.name === "AbortError") {
        return;
      }
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: err.message || "Ocorreu um erro ao processar o streaming.",
      }));
    }
  }, []);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
      }));
    }
  }, []);

  return {
    ...state,
    startStream,
    stopStream,
  };
}
