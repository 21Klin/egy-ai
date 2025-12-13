export const runtime = "edge";
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { listenToUserTrades } from "@/lib/listenToUserTrades";

/* ---------------------------------------------------------------
   Utility: human readable time
----------------------------------------------------------------*/
function timeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const sec = diff / 1000;
  const min = sec / 60;
  const hour = min / 60;
  const day = hour / 24;

  if (sec < 60) return `${Math.floor(sec)}s ago`;
  if (min < 60) return `${Math.floor(min)}m ago`;
  if (hour < 24) return `${Math.floor(hour)}h ago`;
  return `${Math.floor(day)}d ago`;
}

/* ---------------------------------------------------------------
   MAIN PAGE
----------------------------------------------------------------*/
export default function PublicProfilePage({ params }: any) {
  const { username } = params;

  const [profile, setProfile] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  const [stats, setStats] = useState<any>(null);
  const [manualTrades, setManualTrades] = useState<any[]>([]);
  const [botTrades, setBotTrades] = useState<any[]>([]);

  const [showAllManual, setShowAllManual] = useState(false);
  const [showAllBot, setShowAllBot] = useState(false);

  useEffect(() => {
    if (!username) return;

    const load = async () => {
      // Username → UID
      const usernameRef = doc(db, "usernames", username);
      const usernameSnap = await getDoc(usernameRef);
      if (!usernameSnap.exists()) return setNotFound(true);

      const uid = usernameSnap.data().uid;

      // User profile
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return setNotFound(true);

      const user = userSnap.data();
      setProfile(user);

      // Live trades
      const unsub = listenToUserTrades(uid, (result: any) => {
        if (user.showManualTrades) setManualTrades(result.manual);
        if (user.showBotTrades) setBotTrades(result.bot);

        const all = [...result.manual, ...result.bot];
        setStats(calculateStats(all));
      });

      return () => unsub();
    };

    load();
  }, [username]);

  if (notFound) return <div className="p-6 text-white">User not found.</div>;
  if (!profile || !stats) return <div className="p-6 text-white">Loading...</div>;

  const visibleManual = showAllManual ? manualTrades : manualTrades.slice(0, 5);
  const visibleBot = showAllBot ? botTrades : botTrades.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white space-y-12">

      {/* HEADER */}
      <div className="text-center space-y-3 animate-fade-in">
        <h1 className="
            text-5xl font-extrabold 
            bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-300 
            bg-clip-text text-transparent 
            drop-shadow-[0_0_20px_rgba(0,255,200,0.4)]
        ">
          {profile.username}
        </h1>

        <p className="text-slate-400 tracking-wide">Public Trading Profile</p>
        <p className="text-xs text-slate-500">
          Member since {new Date(profile.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* STATS */}
      <StatsCard stats={stats} />

      {/* MANUAL TRADES */}
      {profile.showManualTrades && (
        <TradeSection
          title="Manual Trades"
          trades={visibleManual}
          expanded={showAllManual}
          total={manualTrades.length}
          onToggle={() => setShowAllManual(!showAllManual)}
        />
      )}

      {/* BOT TRADES */}
      {profile.showBotTrades && (
        <TradeSection
          title="Bot Trades"
          trades={visibleBot}
          expanded={showAllBot}
          total={botTrades.length}
          onToggle={() => setShowAllBot(!showAllBot)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   STATS CALCULATOR (V2)
----------------------------------------------------------------*/
function calculateStats(trades: any[]) {
  if (trades.length === 0)
    return {
      totalTrades: 0,
      winRate: 0,
      avgSize: 0,
      buyRatio: 0,
      botRatio: 0,
      velocity: 0,
      activeDays: 0,
      lastActive: "N/A",
      badge: "Bronze",
    };

  const total = trades.length;

  const wins = trades.filter(t => t.side === "SELL").length;
  const avgSize = trades.reduce((a, b) => a + b.size, 0) / total;

  const buys = trades.filter(t => t.side === "BUY").length;
  const buyRatio = (buys / total) * 100;

  const bot = trades.filter(t => t.tradeType === "bot").length;
  const botRatio = (bot / total) * 100;

  // Active days
  const uniqueDays = new Set(
    trades.map(t => new Date(t.timestamp).toDateString())
  ).size;

  // Velocity (trades per 24 hours)
  const first = Math.min(...trades.map(t => t.timestamp));
  const spanDays = (Date.now() - first) / (1000 * 60 * 60 * 24);
  const velocity = spanDays < 1 ? total : total / spanDays;

  // Last Active
  const last = Math.max(...trades.map(t => t.timestamp));

  // Skill badge
  const badge =
    total > 80 ? "Diamond" :
    total > 40 ? "Gold" :
    total > 20 ? "Silver" : "Bronze";

  return {
    totalTrades: total,
    winRate: Math.round((wins / total) * 100),
    avgSize,
    buyRatio,
    botRatio,
    velocity: velocity.toFixed(1),
    activeDays: uniqueDays,
    lastActive: timeAgo(last),
    badge,
  };
}

/* ---------------------------------------------------------------
   STATS CARD UI
----------------------------------------------------------------*/
function StatsCard({ stats }: any) {
  return (
    <div className="
      bg-slate-900/40 backdrop-blur-xl rounded-3xl 
      border border-teal-500/20 shadow-xl shadow-emerald-500/10 
      p-8 animate-fade-in-up
    ">
      <h2 className="text-2xl font-semibold text-emerald-300 mb-6 drop-shadow">
        Performance Overview
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">

        <Stat label="Total Trades" value={stats.totalTrades} />
        <Stat label="Win Rate" value={`${stats.winRate}%`} />
        <Stat label="Avg Size" value={stats.avgSize.toFixed(4)} />
        <Stat label="Bot Ratio" value={`${stats.botRatio.toFixed(1)}%`} />

        <Stat label="BUY Ratio" value={`${stats.buyRatio.toFixed(1)}%`} />
        <Stat label="Velocity" value={`${stats.velocity}/day`} />
        <Stat label="Active Days" value={stats.activeDays} />
        <Stat label="Last Active" value={stats.lastActive} />

        <div className="col-span-2 sm:col-span-4 pt-4">
          <p className="text-lg font-bold text-emerald-300 drop-shadow">
            Badge: {stats.badge}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="space-y-1 animate-fade-in-up">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

/* ---------------------------------------------------------------
   TRADE LIST SECTION
----------------------------------------------------------------*/
function TradeSection({ title, trades, expanded, total, onToggle }: any) {
  return (
    <div className="space-y-5 animate-fade-in-up">
      <h2 className="text-2xl font-semibold text-emerald-300 drop-shadow">
        {title}
      </h2>

      <div className="space-y-4">
        {trades.map((t: any, i: number) => (
          <TradeCard key={i} t={t} />
        ))}

        {total > 5 && (
          <button
            onClick={onToggle}
            className="
              w-full py-2 rounded-xl bg-slate-800/50 
              border border-slate-700 hover:bg-slate-700/60 
              text-emerald-300 transition-all duration-200
            "
          >
            {expanded ? "Show Less" : `Show All ${total} Trades`}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   TRADE CARD
----------------------------------------------------------------*/
function TradeCard({ t }: any) {
  return (
    <div className="
      p-5 rounded-2xl bg-slate-900/30 backdrop-blur-xl 
      border border-slate-700/40 hover:border-emerald-400/50 
      shadow-lg shadow-black/20 transition-all duration-300 
      animate-fade-in-up hover:scale-[1.02]
    ">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs">
          {new Date(t.timestamp).toLocaleString()}
        </span>

        <span
          className={`
            px-3 py-1 text-xs rounded-md font-bold tracking-wide 
            ${t.side === "BUY" ? "bg-emerald-500/20 text-emerald-300" 
                               : "bg-red-500/20 text-red-300"}
          `}
        >
          {t.side}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs">Price</p>
          <p className="font-semibold">{t.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Size</p>
          <p className="font-semibold">{t.size.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Type</p>
          <p className="font-semibold capitalize">{t.tradeType}</p>
        </div>
      </div>
    </div>
  );
}
