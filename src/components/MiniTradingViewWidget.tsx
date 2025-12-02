'use client';

import { memo, useEffect, useRef } from 'react';

function MiniTradingViewWidget() {
  const container = useRef<HTMLDivElement | null>(null);
  const isWidgetCreated = useRef(false);

  useEffect(() => {
    if (!container.current || isWidgetCreated.current) return;

    const checkTradingView = () => {
      if (typeof window !== 'undefined' && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: 'BINANCE:BTCUSDT',
          interval: '1',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          enable_publishing: false,
          withdateranges: false,
          hide_side_toolbar: true,
          hide_top_toolbar: true,
          allow_symbol_change: false,
          container_id: 'tradingview_chart_container_mini',
          // Always show RSI
          studies: ['RSI@tv-basicstudies'],
        });

        isWidgetCreated.current = true;
      } else {
        setTimeout(checkTradingView, 100);
      }
    };

    checkTradingView();
  }, []);

  return (
    // Parent fills whatever height CardContent gives it
    <div style={{ height: '100%', width: '100%' }}>
      <div
        ref={container}
        id="tradingview_chart_container_mini"
        style={{ height: '100%', width: '100%' }}
      >
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          Loading mini chart...
        </div>
      </div>
    </div>
  );
}

export default memo(MiniTradingViewWidget);
