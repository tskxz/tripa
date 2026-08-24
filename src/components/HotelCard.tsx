"use client";

import { HotelItem } from "@/types/travel";
import { Building2, MapPin, ExternalLink, Star } from "lucide-react";

interface HotelCardProps {
  hotel: HotelItem;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-sky-950 border border-sky-800/50 flex items-center justify-center text-sky-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{hotel.name}</h4>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{hotel.neighborhood}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-slate-100 block">
            {hotel.price_per_night.toFixed(2)} {hotel.currency}
          </span>
          <span className="text-[10px] text-slate-400">por noite</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-semibold text-slate-100">{hotel.rating.toFixed(1)}</span>
          <span className="text-[11px] text-slate-400">/ 10</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Total Estadia</span>
          <span className="text-xs font-semibold text-slate-200">
            {hotel.total_price.toFixed(2)} {hotel.currency}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
        <a
          href={hotel.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition-colors"
        >
          <span>Reservar Alojamento</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
