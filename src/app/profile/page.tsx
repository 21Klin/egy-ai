"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/lib/UserStore";
import { db } from "@/lib/firestore";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";

/* ----------------------------------------------------------
   TYPES
----------------------------------------------------------- */

interface VisibilitySettings {
  showBotTrades: boolean;
  showManualTrades: boolean;
  showBotStats: boolean;
  showManualStats: boolean;
}

interface Trade {
  price: number;
  size: number;
  side: "BUY" | "SELL";
  timestamp: number;
  tradeType: "bot" | "manual";
  pnl?: number; // optional, older trades may not have this
}

/* ----------------------------------------------------------
   MAIN PAGE
----------------------------------------------------------- */

export default function ProfilePage() {
  const { user, profile, loading } = useUserStore();

  const [botTrades, setBotTrades] = useState<Trade[]>([]);
  const [manualTrades, setManualTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<VisibilitySettings | null>(null);

  const [loadingTrades, setLoadingTrades] = useState(true);

  const [showAllManual, setShowAllManual] = useState(false);
  const [showAllBot, setShowAllBot] = useState(false);

  /* ----------------------------------------------------------
     LOAD DATA
  ----------------------------------------------------------- */
  useEffect(() => {
    if (!user || !profile) return;

    const load = async () => {
      const userRef = doc(db, "users", profile.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) return;

      let data = snap.data() as VisibilitySettings;

      // Auto-create default visibility fields if missing
      const defaults: VisibilitySettings = {
        showBotTrades: true,
        showManualTrades: true,
        showBotStats: true,
        showManualStats: true,
      };

      const merged = { ...defaults, ...data };

      // Fix missing fields in Firestore
      await updateDoc(userRef, merged);

      setSettings(merged);

      /* ---- Load trades ---- */
      const botCol = collection(db, "users", profile.uid, "trades");
      const all = await getDocs(botCol);

      const bot: Trade[] = [];
      const man: Trade[] = [];

      all.forEach((d) => {
        const t = d.data() as Trade;

        // Normalize missing PnL
        if (t.pnl === undefined) t.pnl = 0;

        if (t.tradeType === "bot") bot.push(t);
        else man.push(t);
      });

      // Sort newest first
      bot.sort((a, b) => b.timestamp - a.timestamp);
      man.sort((a, b) => b.timestamp - a.timestamp);

      setBotTrades(bot);
      setManualTrades(man);

      setLoadingTrades(false);
    };

    load();
  }, [user, profile]);

  /* ----------------------------------------------------------
     CONDITIONS
  ----------------------------------------------------------- */
  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!user || !profile) return <div className="p-6 text-white">Login required.</div>;
  if (!settings) return <div className="p-6 text-white">Loading settings…</div>;

  const visibleManual = showAllManual ? manualTrades : manualTrades.slice(0, 4);
  const visibleBot = showAllBot ? botTrades : botTrades.slice(0, 4);

  /* ----------------------------------------------------------
     UI
  ----------------------------------------------------------- */

  return (
    <div className="max-w-6xl mx-auto p-6 text-white space-y-14">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-emerald-900/30 to-cyan-800/20 
        border border-emerald-500/20 rounded-2xl p-8 shadow-xl backdrop-blur-xl overflow-hidden">

        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,rgba(0,255,200,0.3),transparent)]" />

        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r 
          from-emerald-300 via-teal-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
          {profile.username}'s Dashboard
        </h1>

        <p className="text-slate-400 mt-2 text-lg">Private Trading Control Center</p>

        <p className="text-sm text-slate-500 mt-3">
          Joined:{" "}
          <span className="text-emerald-300 font-semibold">
            {new Date(profile.createdAt).toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* VISIBILITY SETTINGS */}
      <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 
        backdrop-blur-xl shadow-lg space-y-6">
        
        <h2 className="text-2xl font-bold text-emerald-300">Visibility Settings</h2>

        <div className="space-y-4">
          {Object.keys(settings).map((key) => (
            <PrivacyToggle
              key={key}
              keyItem={key}
              active={settings[key as keyof VisibilitySettings]}
              onClick={async () => {
                const newValue = !settings[key as keyof VisibilitySettings];
                const updated = { ...settings, [key]: newValue };

                setSettings(updated);
                await updateDoc(doc(db, "users", profile.uid), updated);
              }}
            />
          ))}
        </div>
      </div>

      {/* STATS PANEL */}
      <StatsPanel
        showBot={settings.showBotStats}
        showManual={settings.showManualStats}
        botTrades={botTrades}
        manualTrades={manualTrades}
      />

      {/* MANUAL TRADES */}
      {settings.showManualTrades && (
        <TradeSectionPrivate
          title="Manual Trades"
          trades={visibleManual}
          total={manualTrades.length}
          expanded={showAllManual}
          onToggle={() => setShowAllManual(!showAllManual)}
        />
      )}

      {/* BOT TRADES */}
      {settings.showBotTrades && (
        <TradeSectionPrivate
          title="Bot Trades"
          trades={visibleBot}
          total={botTrades.length}
          expanded={showAllBot}
          onToggle={() => setShowAllBot(!showAllBot)}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------------
   COMPONENTS
----------------------------------------------------------- */

function PrivacyToggle({
  keyItem,
  active,
  onClick,
}: {
  keyItem: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex justify-between items-center border-b border-slate-700 pb-3">
      <span className="capitalize text-slate-300">
        {keyItem.replace(/([A-Z])/g, " $1")}
      </span>

      <button
        onClick={onClick}
        className={`px-4 py-1 rounded-full text-xs font-semibold transition shadow-md ${
          active
            ? "bg-emerald-500 text-black shadow-emerald-500/30"
            : "bg-slate-700 text-white"
        }`}
      >
        {active ? "Visible" : "Hidden"}
      </button>
    </div>
  );
}

function StatsPanel({
  showBot,
  showManual,
  botTrades,
  manualTrades,
}: {
  showBot: boolean;
  showManual: boolean;
  botTrades: Trade[];
  manualTrades: Trade[];
}) {
  const makeStats = (trades: Trade[]) => {
    if (!trades.length) return { total: 0, wins: 0, rate: 0 };

    const wins = trades.filter((t) => (t.pnl ?? 0) >= 0).length;
    return {
      total: trades.length,
      wins,
      rate: Math.round((wins / trades.length) * 100),
    };
  };

  const bot = makeStats(botTrades);
  const man = makeStats(manualTrades);

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <h2 className="text-2xl font-bold text-cyan-300 mb-6">Performance Metrics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {showBot && <StatCard label="Bot Trades" value={bot.total} accent="cyan" />}
        {showBot && <StatCard label="Bot Win Rate" value={`${bot.rate}%`} accent="cyan" />}
        {showManual && <StatCard label="Manual Trades" value={man.total} accent="emerald" />}
        {showManual && <StatCard label="Manual Win Rate" value={`${man.rate}%`} accent="emerald" />}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: any; accent: string }) {
  const colors =
    accent === "cyan"
      ? "from-cyan-400/20 to-cyan-600/10 border-cyan-500/30"
      : "from-emerald-400/20 to-emerald-600/10 border-emerald-500/30";

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colors} border shadow-lg`}>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function TradeSectionPrivate({
  title,
  trades,
  total,
  expanded,
  onToggle,
}: {
  title: string;
  trades: Trade[];
  total: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-emerald-300">{title}</h2>

      {trades.length === 0 ? (
        <p className="text-slate-500">No trades available.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {trades.map((t, i) => (
            <TradeCardPrivate t={t} key={i} />
          ))}
        </div>
      )}

      {total > 4 && (
        <button
          onClick={onToggle}
          className="w-full py-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition text-emerald-300"
        >
          {expanded ? "Show Less" : `Show All ${total} Trades`}
        </button>
      )}
    </div>
  );
}

function TradeCardPrivate({ t }: { t: Trade }) {
  return (
    <div className="p-5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/40 shadow-xl">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs">
          {new Date(t.timestamp).toLocaleString()}
        </span>

        <span
          className={`px-2 py-1 text-xs rounded-md font-semibold ${
            t.side === "BUY"
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {t.side}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-500 text-xs">Price</p>
          <p className="font-bold">{t.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Size</p>
          <p className="font-bold">{t.size.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-slate-500 text-xs">Type</p>
          <p className="font-bold capitalize">{t.tradeType}</p>
        </div>
      </div>
    </div>
  );
}
