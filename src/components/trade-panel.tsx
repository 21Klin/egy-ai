"use client";

import { useStore } from "@/lib/store";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

function Wallet() {
  const { usdtBalance, btcBalance, price } = useStore((state) => ({
    usdtBalance: state.usdtBalance,
    btcBalance: state.btcBalance,
    price: state.price,
  }));

  const btcValueInUsdt = btcBalance * price;
  const totalValue = usdtBalance + btcValueInUsdt;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline">
        <span className="text-muted-foreground">Total Value</span>
        <span className="font-mono text-lg font-bold">
          ${totalValue.toFixed(2)}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">USDT</span>
          <span className="font-mono">{usdtBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC</span>
          <span className="font-mono">{btcBalance.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
}

function SpotTrading() {
  const { buyBtc, sellBtc } = useStore();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          onClick={() => buyBtc()}
        >
          BUY
        </Button>
        <Button
          className="h-12 bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          onClick={() => sellBtc()}
        >
          SELL
        </Button>
      </div>
    </div>
  );
}

function LeverageTrading() {
  const { position, pnl, enterPosition, closePosition } = useStore();

  if (position) {
    const pnlPercentage = (pnl / position.entryPrice) * 100 || 0;
    const isProfit = pnl >= 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Direction</div>
            <div
              className={cn(
                'text-lg font-bold uppercase',
                position.direction === 'buy' ? 'text-success' : 'text-destructive'
              )}
            >
              {position.direction}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Entry Price</div>
            <div className="text-lg font-bold font-mono">
              ${position.entryPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-sm text-muted-foreground">Live P/L</div>
          <div
            className={cn(
              'text-2xl font-bold font-mono',
              isProfit ? 'text-success' : 'text-destructive'
            )}
          >
            {isProfit ? '+' : ''}${pnl.toFixed(2)} ({isProfit ? '+' : ''}
            {pnlPercentage.toFixed(2)}%)
          </div>
          <div className="text-xs text-muted-foreground">
            Position opened{' '}
            {formatDistanceToNow(position.timestamp, { addSuffix: true })}
          </div>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={closePosition}
        >
          Close Position
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center text-sm text-muted-foreground mb-4">
        Open a 1x leveraged position
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          onClick={() => enterPosition('buy')}
        >
          BUY
        </Button>
        <Button
          className="h-12 bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          onClick={() => enterPosition('sell')}
        >
          SELL
        </Button>
      </div>
    </div>
  );
}

function GeneticAlgorithmTrader() {
  const { gaStatus, generation, startGA, stopGA, episodeStartTime } = useStore(state => ({
    gaStatus: state.autoTrader.gaStatus,
    generation: state.autoTrader.generation,
    startGA: state.startGA,
    stopGA: state.stopGA,
    episodeStartTime: state.autoTrader.episodeStartTime,
  }));
  
  const handleToggle = (checked: boolean) => {
    if (checked) {
      startGA();
    } else {
      stopGA();
    }
  };
  
  const EPISODE_DURATION_SECONDS = 2 * 60;
  const timeRemaining = episodeStartTime ? Math.max(0, EPISODE_DURATION_SECONDS - ((Date.now() - episodeStartTime) / 1000)) : 0;

  return (
    <div className="space-y-4">
       <div className="flex items-center space-x-2 rounded-lg border p-4">
         <Switch
           id="ga-trader-switch"
           checked={gaStatus === 'running'}
           onCheckedChange={handleToggle}
         />
         <Label htmlFor="ga-trader-switch" className="flex flex-col">
           <span className="font-semibold">Genetic Algorithm Trader</span>
           <span className={cn(
             "text-xs",
             gaStatus === 'running' ? 'text-success' : 'text-muted-foreground'
           )}>
             {gaStatus === 'running' ? `Running...` : 'Idle'}
           </span>
         </Label>
       </div>

       {gaStatus === 'running' && (
        <div className="text-sm space-y-2 font-mono">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Generation:</span>
            <span>{generation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Episode Time Left:</span>
            <span>{timeRemaining.toFixed(0)}s</span>
          </div>
        </div>
       )}
    </div>
  )
}


export default function TradePanel() {
  return (
    <Card>
       <CardHeader className="p-4">
         <Wallet />
       </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <Tabs defaultValue="spot">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="leverage">Leverage</TabsTrigger>
            <TabsTrigger value="ga">GA Bot</TabsTrigger>
          </TabsList>
          <TabsContent value="spot" className="pt-4">
            <SpotTrading />
          </TabsContent>
          <TabsContent value="leverage" className="pt-4">
            <LeverageTrading />
          </TabsContent>
           <TabsContent value="ga" className="pt-4">
            <GeneticAlgorithmTrader />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
