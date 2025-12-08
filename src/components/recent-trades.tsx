'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function RecentTrades() {
  const { trades } = useStore();

  return (
    <div className="font-mono text-xs">
      {/* HEADER */}
      <div className="grid grid-cols-3 px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>

      {/* TRADES */}
      <div className="space-y-px overflow-hidden px-2">
        {trades.map((trade, i) => (
          <div
            key={i}
            className={cn(
              'grid grid-cols-3 items-center h-6 rounded-md px-1 transition-colors duration-150',
              'hover:bg-slate-900/60'
            )}
          >
            {/* PRICE */}
            <span
              className={cn(
                trade.isMaker
                  ? 'text-red-400 drop-shadow-sm'
                  : 'text-emerald-400 drop-shadow-sm'
              )}
            >
              {trade.price.toFixed(2)}
            </span>

            {/* AMOUNT */}
            <span className="text-right text-slate-200">
              {trade.quantity.toFixed(4)}
            </span>

            {/* TIME */}
            <span className="text-right text-slate-500">
              {format(trade.time, 'HH:mm:ss')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
