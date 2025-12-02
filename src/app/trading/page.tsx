"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataProvider } from "@/components/data-provider";
import TradingChart from "@/components/trading-chart";
import TradePanel from "@/components/trade-panel";
import OrderBook from "@/components/order-book";
import { KraferSimLogo } from "@/components/icons";
import SparklineChart from "@/components/sparkline-chart";
import RecentTrades from "@/components/recent-trades";
import MiniTradingViewWidget from "@/components/MiniTradingViewWidget";

function Header() {
  return (
    <header className="flex h-16 items-center border-b px-4 sm:px-6">
      <KraferSimLogo className="h-8 w-8 text-primary" />
      <h1 className="ml-3 text-xl font-semibold sm:text-2xl">
        Low-Latency Trading Agent
      </h1>
    </header>
  );
}

export default function TradingPage() {
  return (
    <DataProvider>
      <div className="flex h-screen w-full flex-col bg-background text-foreground">
        <Header />
        <main className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[1fr_450px]">
          {/* LEFT SIDE: sparkline, big chart, recent trades */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="p-4">
                <SparklineChart />
              </CardContent>
            </Card>

            <Card className="h-[500px]">
              <TradingChart />
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Trades</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <RecentTrades />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* RIGHT SIDE: Trade panel → Order book → Mini chart */}
          <div className="flex flex-col gap-2">
            {/* 1️⃣ Trade panel (already a Card inside) */}
            <TradePanel />

            {/* 2️⃣ Order book */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base">Order Book</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OrderBook />
              </CardContent>
            </Card>

            {/* 3️⃣ Mini RSI chart */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-base">Momentum (RSI)</CardTitle>
              </CardHeader>
              {/* ⬇️ FORCE HEIGHT HERE */}
              <CardContent className="p-0" style={{ height: 400 }}>
                <MiniTradingViewWidget />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DataProvider>
  );
}
