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

// ---------------- WALLET ----------------

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
      <div className="flex items-baseline justify-between">
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

// ---------------- SPOT TRADING ----------------

function SpotTrading() {
  const { buyBtc, sellBtc, btcBalance } = useStore();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          onClick={() => buyBtc(100)}
        >
          BUY ($100)
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
  } = useStore();

  const leverageOptions = [1, 2, 4, 8];

  if (position) {
    const pnlPercentage =
      ((pnl / position.size) * 100 * position.leverage) || 0;
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
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="h-12 bg-success/80 text-success-foreground hover:bg-success"
          onClick={() => enterPosition("buy")}
        >
          BUY
        </Button>
        <Button
          className="h-12 bg-destructive/80 text-destructive-foreground hover:bg-destructive"
          onClick={() => enterPosition("sell")}
        >
          SELL
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

// ---------------- PROFIT BOT ----------------

function ProfitBotTrader() {
  const [isRunning, setIsRunning] = useState(false);
  const { simulateProfitBotTrade } = useStore();
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleToggle = (shouldRun: boolean) => {
    setIsRunning(shouldRun);
  };

  useEffect(() => {
    if (isRunning) {
      simulationIntervalRef.current = setInterval(() => {
        simulateProfitBotTrade();
      }, 20000); // 20 seconds

      toast.success("Profit Bot Started", {
        description: "Wallet value will increase every 20 seconds.",
      });
    } else {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
        toast.info("Profit Bot Stopped.");
      }
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isRunning, simulateProfitBotTrade]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">Profit Bot</h3>
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
          aria-label="Toggle Profit Bot"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-muted-foreground">Status:</div>
        <div className="text-right font-mono">
          {isRunning ? "Adding Profit" : "Idle"}
        </div>
        <div className="text-muted-foreground">Next Profit:</div>
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
      <CardContent className="flex min-h-0 flex-grow flex-col space-y-4 p-0">
        <Tabs defaultValue="spot" className="flex min-h-0 flex-grow flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="leverage">Leverage</TabsTrigger>
            <TabsTrigger value="ga-bot">GA Bot</TabsTrigger>
            <TabsTrigger value="profit-bot">Profit Bot</TabsTrigger>
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

          <TabsContent value="profit-bot" className="p-4">
            <ProfitBotTrader />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
