"use client";

import { FlightItem } from "@/types/travel";
import { Plane, ExternalLink, ArrowRight, Calendar } from "lucide-react";

interface FlightCardProps {
  flight: FlightItem;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <Plane className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">{flight.airline}</h4>
            <span className="text-[10px] text-neutral-400">Voo Recomendado</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-white">
            {flight.price.toFixed(2)} {flight.currency}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 items-center text-xs">
        <div className="col-span-2 space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Origem</span>
          <span className="font-semibold text-neutral-200 block truncate">{flight.departure.airport}</span>
        </div>

        <div className="col-span-1 flex justify-center text-neutral-400">
          <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
        </div>

        <div className="col-span-2 text-right space-y-0.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Destino</span>
          <span className="font-semibold text-neutral-200 block truncate">{flight.arrival.airport}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-neutral-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span>Reserva direta online</span>
        </div>

        <a
          href={flight.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors"
        >
          <span>Ver Voo</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
