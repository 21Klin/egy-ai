'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function RecentTrades() {
  const { trades } = useStore();

  return (
    <div className="font-mono text-xs">
      <div className="grid grid-cols-3 px-2 py-1 text-muted-foreground">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
        <span className="text-right">Time</span>
      </div>
      <div className="space-y-px overflow-hidden px-2">
        {trades.map((trade, i) => (
          <div key={i} className="grid grid-cols-3 items-center h-5">
            <span
              className={cn(
                trade.isMaker ? 'text-destructive' : 'text-success'
              )}
            >
              {trade.price.toFixed(2)}
            </span>
            <span className="text-right">{trade.quantity.toFixed(4)}</span>
            <span className="text-right text-muted-foreground">
              {format(trade.time, 'HH:mm:ss')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
