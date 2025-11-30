'use client';

import { useMemo } from 'react';
import { useStore, type Order } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

function OrderBookRow({
  order,
  type,
  maxCumulative,
}: {
  order: Order;
  type: 'bid' | 'ask';
  maxCumulative: number;
}) {
  const [price, quantity, cumulative] = order;

  const bgWidth = useMemo(
    () => (Number(cumulative) / maxCumulative) * 100,
    [cumulative, maxCumulative]
  );

  return (
    <div className="relative grid grid-cols-2 text-xs font-mono h-5 items-center px-2">
      <div
        className={cn(
          'absolute top-0 bottom-0 h-full',
          type === 'bid'
            ? 'bg-success/20 right-0'
            : 'bg-destructive/20 right-0'
        )}
        style={{ width: `${bgWidth}%` }}
      ></div>
      <span
        className={cn(
          'z-10 text-left',
          type === 'ask' ? 'text-destructive' : 'text-success'
        )}
      >
        {parseFloat(price).toFixed(2)}
      </span>
      <span className="z-10 text-right">{parseFloat(quantity).toFixed(4)}</span>
    </div>
  );
}

export default function OrderBook() {
  const { depthData, price, priceChange } = useStore((state) => ({
    depthData: state.depthData,
    price: state.price,
    priceChange: state.priceChange,
  }));
  const numRows = 4;

  const { processedBids, processedAsks, maxCumulative } = useMemo(() => {
    let cumulativeBids = 0;
    const bidsWithCumulative = depthData.bids
      .slice(0, numRows)
      .map(([price, quantity]) => {
        cumulativeBids += Number(quantity);
        return [price, quantity, cumulativeBids.toString()];
      });

    let cumulativeAsks = 0;
    const asksWithCumulative = depthData.asks
      .slice(0, numRows)
      .map(([price, quantity]) => {
        cumulativeAsks += Number(quantity);
        return [price, quantity, cumulativeAsks.toString()];
      })
      .reverse();

    const max = Math.max(cumulativeBids, cumulativeAsks);

    return {
      processedBids: bidsWithCumulative,
      processedAsks: asksWithCumulative,
      maxCumulative: max,
    };
  }, [depthData]);

  if (processedAsks.length === 0 || processedBids.length === 0) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 13 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col font-mono text-xs">
      <div className="grid grid-cols-2 px-2 py-1 text-muted-foreground">
        <span>Price (USDT)</span>
        <span className="text-right">Amount (BTC)</span>
      </div>
      <div className="flex-1 space-y-px overflow-hidden">
        {processedAsks.map((order, i) => (
          <OrderBookRow
            key={`ask-${i}`}
            order={order}
            type="ask"
            maxCumulative={maxCumulative}
          />
        ))}
      </div>
      <div
        className={cn(
          'flex items-center gap-2 border-y py-2 px-2 my-1 font-sans text-lg font-bold',
          priceChange === 'up' && 'text-success',
          priceChange === 'down' && 'text-destructive'
        )}
      >
        <span>{price.toFixed(2)}</span>
        {priceChange === 'up' && '↑'}
        {priceChange === 'down' && '↓'}
      </div>
      <div className="flex-1 space-y-px overflow-hidden">
        {processedBids.map((order, i) => (
          <OrderBookRow
            key={`bid-${i}`}
            order={order}
            type="bid"
            maxCumulative={maxCumulative}
          />
        ))}
      </div>
    </div>
  );
}
