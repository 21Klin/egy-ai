"use client";

import { useStore } from "@/lib/store";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Switch } from "./ui/switch";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";

// ---------------- WALLET ----------------

function Wallet() {
  const { usdtBalance, btcBalance, price, position, pnl } = useStore(
    (state) => ({
      usdtBalance: state.usdtBalance,
      btcBalance: state.btcBalance,
      price: state.price,
      position: state.position,
      pnl: state.pnl,
    })
  );

  const btcValueInUsdt = btcBalance * price;
  const totalValue = usdtBalance + btcValueInUsdt + (position ? pnl : 0);

  const marginUsed = position ? position.size ?? 0 : 0;
  const leverageBtc =
    position && position.entryPrice > 0
      ? ((position.size ?? 0) / position.entryPrice) *
        (position.leverage ?? 1) *
        (position.direction === "buy" ? 1 : -1)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="text-muted-foreground">Total Value</span>
        <span className="font-mono text-lg font-bold">
          ${totalValue.toFixed(2)}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">USDT (cash)</span>
          <span className="font-mono">{usdtBalance.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">BTC (spot)</span>
          <span className="font-mono">{btcBalance.toFixed(6)}</span>
        </div>

        {position && (
          <>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">
                Margin in position (leverage)
              </span>
              <span className="font-mono">{marginUsed.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                BTC exposure (leverage)
              </span>
              <span className="font-mono">
                {Math.abs(leverageBtc).toFixed(6)}{" "}
                {leverageBtc > 0 ? "long" : leverageBtc < 0 ? "short" : ""}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------- SPOT TRADING ----------------

function SpotTrading() {
  const { buyBtc, sellBtc, btcBalance, usdtBalance, price } = useStore();
  const [amountUsd, setAmountUsd] = useState(100);

  const canBuy = price > 0 && usdtBalance > 0 && amountUsd > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spot-amount">Amount (USDT)</Label>
        <Input
          id="spot-amount"
          type="number"
          min={1}
          step={10}
          value={amountUsd}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAmountUsd(Number.isNaN(v) ? 0 : v);
          }}
        />
        <p className="text-xs text-muted-foreground">
          How many USDT worth of BTC you want to buy in one click.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <Button variant="outline" onClick={() => setAmountUsd(25)}>
          25 USDT
        </Button>
        <Button variant="outline" onClick={() => setAmountUsd(50)}>
          50 USDT
        </Button>
        <Button variant="outline" onClick={() => setAmountUsd(100)}>
          100 USDT
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          disabled={!canBuy}
          onClick={() => buyBtc(amountUsd)}
        >
          BUY ({amountUsd || 0} USDT)
        </Button>
        <Button
          className="h-12 bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          onClick={() => sellBtc(btcBalance)}
          disabled={btcBalance <= 0}
        >
          SELL (ALL)
        </Button>
      </div>
    </div>
  );
}

// ---------------- LEVERAGE TRADING ----------------

function LeverageTrading() {
  const {
    position,
    pnl,
    enterPosition,
    closePosition,
    leverage,
    setLeverage,
    positionSize,
    setPositionSize,
  } = useStore();

  const leverageOptions = [1, 2, 4, 8];

  if (position) {
    const pnlPercentage =
      ((pnl / (position.size || 1)) * 100 * (position.leverage || 1)) || 0;
    const isProfit = pnl >= 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-muted-foreground">Direction</div>
            <div
              className={cn(
                "text-lg font-bold uppercase",
                position.direction === "buy"
                  ? "text-success"
                  : "text-destructive"
              )}
            >
              {position.direction}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Leverage</div>
            <div className="font-mono text-lg font-bold">
              {position.leverage}x
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Entry Price</div>
            <div className="font-mono text-lg font-bold">
              ${position.entryPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-center">
          <div className="text-sm text-muted-foreground">Live P/L</div>
          <div
            className={cn(
              "font-mono text-2xl font-bold",
              isProfit ? "text-success" : "text-destructive"
            )}
          >
            {isProfit ? "+" : ""}${pnl.toFixed(2)} ({isProfit ? "+" : ""}
            {pnlPercentage.toFixed(2)}%)
          </div>
          <div className="text-xs text-muted-foreground">
            Position opened{" "}
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Leverage</Label>
        <RadioGroup
          value={leverage.toString()}
          onValueChange={(value) => setLeverage(Number(value))}
          className="flex gap-4"
        >
          {leverageOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option.toString()} id={`r${option}`} />
              <Label htmlFor={`r${option}`} className="font-normal">
                {option}x
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lev-size">Position size (USDT)</Label>
        <Input
          id="lev-size"
          type="number"
          min={10}
          step={10}
          value={positionSize}
          onChange={(e) => {
            const v = Number(e.target.value);
            setPositionSize(Number.isNaN(v) ? 0 : v);
          }}
        />
        <p className="text-xs text-muted-foreground">
          Margin used per leveraged position. Higher = bigger exposure.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          onClick={() => enterPosition("buy")}
        >
          Long
        </Button>
        <Button
          className="h-12 bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          onClick={() => enterPosition("sell")}
        >
          Short
        </Button>
      </div>
    </div>
  );
}

// ---------------- GA BOT SIMULATOR ----------------

function GeneticAlgorithmTrader() {
  const [isRunning, setIsRunning] = useState(false);
  const { simulateGABotTrade } = useStore();
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = (shouldRun: boolean) => {
    setIsRunning(shouldRun);
  };

  useEffect(() => {
    if (isRunning) {
      simulationIntervalRef.current = setInterval(() => {
        simulateGABotTrade();
      }, 20000); // 20 seconds

      toast.success("GA Bot Simulation Started", {
        description: "Wallet value will change every 20 seconds.",
      });
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
        toast.info("GA Bot Simulation Stopped.");
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isRunning, simulateGABotTrade]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">GA Bot Simulator</h3>
          <p
            className={cn(
              "text-sm",
              isRunning ? "text-success" : "text-muted-foreground"
            )}
          >
            {isRunning ? "Running" : "Stopped"}
          </p>
        </div>
        <Switch
          checked={isRunning}
          onCheckedChange={handleToggle}
          aria-label="Toggle GA Bot Simulator"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-muted-foreground">Status:</div>
        <div className="text-right font-mono">
          {isRunning ? "Simulating Trades" : "Idle"}
        </div>
        <div className="text-muted-foreground">Next Change:</div>
        <div className="text-right font-mono">
          {isRunning ? "~20s" : "N/A"}
        </div>
      </div>
    </div>
  );
}

// ---------------- MAIN PANEL ----------------

export default function TradePanel() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0 border-b p-4">
        <Wallet />
      </CardHeader>
      <CardContent className="flex min-h-0 flex-col space-y-4 p-0">
        <Tabs defaultValue="spot" className="flex min-h-0 flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="leverage">Leverage</TabsTrigger>
            <TabsTrigger value="ga-bot">GA Bot</TabsTrigger>
          </TabsList>

          <TabsContent value="spot" className="p-4">
            <SpotTrading />
          </TabsContent>

          <TabsContent value="leverage" className="p-4">
            <LeverageTrading />
          </TabsContent>

          <TabsContent value="ga-bot" className="p-4">
            <GeneticAlgorithmTrader />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
