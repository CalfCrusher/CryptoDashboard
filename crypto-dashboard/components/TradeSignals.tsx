'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CircleStackIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface TradeSetup {
  side: 'LONG' | 'SHORT';
  entry: number;
  tp: number;
  sl: number;
  tpPct: number;
  slPct: number;
  rr: number;
  isRetest?: boolean;
}

interface TradeSignal {
  symbol: string;
  price: number;
  state: string;
  actionHint: string;
  tradeable: boolean;
  rsi: number | null;
  trend: 'UP' | 'DOWN';
  tradeSetup: TradeSetup | null;
  priceChange24h: number;
  volumeOk: boolean;
}

interface TradeSignalsData {
  timestamp: string;
  total: number;
  safeSignals: TradeSignal[];
  retestSignals: TradeSignal[];
  watchSignals: TradeSignal[];
}

function SignalCard({ signal }: { signal: TradeSignal }) {
  const setup = signal.tradeSetup;
  if (!setup) return null;

  const isLong = setup.side === 'LONG';
  const actionText = signal.actionHint.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="bg-linear-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{signal.symbol.replace('USDT', '')}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            isLong ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {setup.side}
          </span>
          {setup.isRetest && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
              RETEST
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 ${
          signal.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {signal.priceChange24h >= 0 ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
          <span className="text-sm font-medium">{signal.priceChange24h.toFixed(2)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-slate-400 mb-1">Entry</div>
          <div className="text-sm font-semibold text-white">${setup.entry.toFixed(setup.entry < 1 ? 6 : 2)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Current</div>
          <div className="text-sm font-semibold text-white">${signal.price.toFixed(signal.price < 1 ? 6 : 2)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <CircleStackIcon className="w-3 h-3" />
            Take Profit
          </div>
          <div className="text-sm font-semibold text-green-400">
            ${setup.tp.toFixed(setup.tp < 1 ? 6 : 2)} ({setup.tpPct.toFixed(1)}%)
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
            <ShieldCheckIcon className="w-3 h-3" />
            Stop Loss
          </div>
          <div className="text-sm font-semibold text-red-400">
            ${setup.sl.toFixed(setup.sl < 1 ? 6 : 2)} ({setup.slPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">R:R</span>
          <span className={`text-sm font-bold ${
            setup.rr >= 3 ? 'text-green-400' : setup.rr >= 2 ? 'text-blue-400' : 'text-amber-400'
          }`}>
            {setup.rr.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {signal.rsi && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              signal.rsi < 30 ? 'bg-green-500/20 text-green-400' :
              signal.rsi > 70 ? 'bg-red-500/20 text-red-400' :
              'bg-slate-700/50 text-slate-400'
            }`}>
              RSI {signal.rsi.toFixed(0)}
            </span>
          )}
          {signal.volumeOk && (
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
              VOL ✓
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-400 italic">
        {actionText}
      </div>
    </div>
  );
}

export default function TradeSignals() {
  const [data, setData] = useState<TradeSignalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSignals() {
      try {
        setLoading(true);
        const response = await fetch('/api/trade-signals');
        if (!response.ok) throw new Error('Failed to fetch signals');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-linear-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <CircleStackIcon className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Trade Signals</h2>
        </div>
        <div className="text-center py-8 text-slate-400">Loading signals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-linear-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon className="text-amber-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Trade Signals</h2>
        </div>
        <div className="text-center py-8 text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-linear-to-br from-slate-800/30 to-slate-900/30 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CircleStackIcon className="text-blue-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Trade Signals</h2>
        </div>
        <div className="text-xs text-slate-400">
          Updated: {new Date(data.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {data.safeSignals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            Safe Trades ({data.safeSignals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.safeSignals.map(signal => (
              <SignalCard key={signal.symbol} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {data.retestSignals.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-4 h-4" />
            Retest Opportunities ({data.retestSignals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.retestSignals.map(signal => (
              <SignalCard key={signal.symbol} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {data.watchSignals.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            Watch List ({data.watchSignals.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.watchSignals.map(signal => (
              <SignalCard key={signal.symbol} signal={signal} />
            ))}
          </div>
        </div>
      )}

      {data.safeSignals.length === 0 && data.retestSignals.length === 0 && data.watchSignals.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No trade signals at this time. All assets are in neutral zone.
        </div>
      )}
    </div>
  );
}
