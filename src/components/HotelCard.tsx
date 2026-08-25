"use client";

import { HotelItem } from "@/types/travel";
import { Building2, MapPin, ExternalLink, Star } from "lucide-react";

interface HotelCardProps {
  hotel: HotelItem;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white line-clamp-1">{hotel.name}</h4>
            <div className="flex items-center space-x-1 text-[10px] text-neutral-400">
              <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
              <span className="truncate">{hotel.neighborhood}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-white block">
            {hotel.price_per_night.toFixed(2)} {hotel.currency}
          </span>
          <span className="text-[10px] text-neutral-400">por noite</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="font-semibold text-white">{hotel.rating.toFixed(1)}</span>
          <span className="text-[10px] text-neutral-400">/ 10</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutral-500 block">Total Estadia</span>
          <span className="text-xs font-semibold text-neutral-200">
            {hotel.total_price.toFixed(2)} {hotel.currency}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-end">
        <a
          href={hotel.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors"
        >
          <span>Reservar Alojamento</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
