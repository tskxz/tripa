export interface HealthCheckResponse {
  status: string;
  version: string;
  services: {
    llm_groq: string;
    mcp_kiwi: string;
    mcp_tavily: string;
    [key: string]: string;
  };
  timestamp: string;
}

export interface ChatStreamStep {
  step_id: string;
  title: string;
  status: "running" | "completed" | "failed";
}

export interface BudgetSummary {
  flights_cost: number;
  hotel_cost: number;
  daily_food_and_transport: number;
  activities_cost: number;
  emergency_buffer: number;
  total_estimated: number;
  currency: string;
  is_under_budget: boolean;
}

export interface ChatStreamDone {
  status: string;
  conversation_id: string;
}

export interface StreamEventItem {
  id: string;
  type: "step" | "message_delta" | "budget_summary" | "done" | "error";
  timestamp: string;
  payload: any;
}
