"use client";

import { BudgetSummary } from "@/types/travel";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";

interface BudgetSummaryCardProps {
  budget: BudgetSummary;
}

export function BudgetSummaryCard({ budget }: BudgetSummaryCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-black dark:text-white">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-black dark:text-white">Resumo Orçamental Estimado</h4>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">Consolidação de Custos Previstos</span>
          </div>
        </div>

        <div>
          {budget.is_under_budget ? (
            <span className="inline-flex items-center space-x-1.5 text-neutral-800 dark:text-neutral-200 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white" />
              <span>Dentro do Orçamento</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 text-neutral-500 dark:text-neutral-400 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>Acima do Pretendido</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Voos</span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
            {budget.flights_cost.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-2.5 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Alojamento</span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
            {budget.hotel_cost.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-2.5 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Alimentação & Transp.</span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
            {budget.daily_food_and_transport.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-2.5 rounded bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Atividades & Margem</span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
            {(budget.activities_cost + budget.emergency_buffer).toFixed(2)} {budget.currency}
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Custo Total Estimado</span>
        <span className="text-sm sm:text-base font-bold text-black dark:text-white">
          {budget.total_estimated.toFixed(2)} {budget.currency}
        </span>
      </div>
    </div>
  );
}
