"use client";

import { BudgetSummary } from "@/types/travel";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";

interface BudgetSummaryCardProps {
  budget: BudgetSummary;
}

export function BudgetSummaryCard({ budget }: BudgetSummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-sky-950 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100">Resumo Orçamental Estimado</h4>
            <span className="text-[11px] text-slate-400">Consolidação de Custos Previstos</span>
          </div>
        </div>

        <div>
          {budget.is_under_budget ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[11px] font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Dentro do Orçamento</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 text-[11px] font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>Acima do Pretendido</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Voos</span>
          <span className="text-xs font-semibold text-slate-200 block">
            {budget.flights_cost.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Alojamento</span>
          <span className="text-xs font-semibold text-slate-200 block">
            {budget.hotel_cost.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Alimentação & Transp.</span>
          <span className="text-xs font-semibold text-slate-200 block">
            {budget.daily_food_and_transport.toFixed(2)} {budget.currency}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Atividades & Margem</span>
          <span className="text-xs font-semibold text-slate-200 block">
            {(budget.activities_cost + budget.emergency_buffer).toFixed(2)} {budget.currency}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">Custo Total Estimado</span>
        <span className="text-base font-bold text-sky-400">
          {budget.total_estimated.toFixed(2)} {budget.currency}
        </span>
      </div>
    </div>
  );
}
