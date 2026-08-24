"use client";

import { FlightItem } from "@/types/travel";
import { Plane, ExternalLink, ArrowRight, Calendar } from "lucide-react";

interface FlightCardProps {
  flight: FlightItem;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-sky-950 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100">{flight.airline}</h4>
            <span className="text-[11px] text-slate-400">Voo Recomendado</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-100">
            {flight.price.toFixed(2)} {flight.currency}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 items-center text-xs">
        <div className="col-span-2 space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Origem</span>
          <span className="font-semibold text-slate-200 block truncate">{flight.departure.airport}</span>
        </div>

        <div className="col-span-1 flex justify-center text-slate-500">
          <ArrowRight className="w-4 h-4 text-sky-500" />
        </div>

        <div className="col-span-2 text-right space-y-0.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destino</span>
          <span className="font-semibold text-slate-200 block truncate">{flight.arrival.airport}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Reserva direta online</span>
        </div>

        <a
          href={flight.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors"
        >
          <span>Ver Voo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
