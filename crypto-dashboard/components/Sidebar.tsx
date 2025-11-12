'use client';

import { AssetAnalysis, MarketOverview } from '@/types';
import { formatPercentage } from '@/lib/analysis';
import { useMemo, useState } from 'react';

interface SidebarProps {
  assets: AssetAnalysis[];
  marketOverview: MarketOverview | null;
  missedUpdates: number;
  onAlertClick?: (assetId: string) => void;
}

/**
 * Sticky sidebar for xl+ viewports. Hidden on smaller widths.
 * Includes Alerts, Quick Stats, and a collapsible Correlation Matrix.
 */
export default function Sidebar({ assets, marketOverview, missedUpdates, onAlertClick }: SidebarProps) {
  const [showCorrelation, setShowCorrelation] = useState(false);

  // Build alerts: strong signals, large 24h moves, missed updates
  const alerts = useMemo(() => {
    const items: Array<{ id: string; symbol: string; kind: 'signal' | 'move' | 'system'; text: string; priority: number }>= [];
    assets.forEach(a => {
      if (a.signal.strength.includes('STRONG')) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'signal', text: `${a.signal.strength} ${a.signal.direction}`, priority: 3 });
      }
      const pct = a.currentPrice.changePercent24h;
      if (Math.abs(pct) >= 8) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'move', text: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}% / 24h`, priority: 2 });
      }
    });
    if (missedUpdates > 0) {
      items.push({ id: 'system-missed', symbol: 'SYS', kind: 'system', text: `Missed updates: ${missedUpdates}`, priority: 4 });
    }
    // Sort by priority desc
    return items.sort((a,b) => b.priority - a.priority).slice(0, 8);
  }, [assets, missedUpdates]);

  // Quick stats: top gainers/losers and biggest momentum movers
  const quick = useMemo(() => {
    const sortedByChange = [...assets].sort((a,b) => b.currentPrice.changePercent24h - a.currentPrice.changePercent24h);
    const sortedByMomentum = [...assets].sort((a,b) => b.signal.momentum - a.signal.momentum);
    return {
      topGainers: sortedByChange.slice(0,3),
      topLosers: sortedByChange.slice(-3).reverse(),
      topMomentum: sortedByMomentum.slice(0,3)
    };
  }, [assets]);

  return (
    <aside className="hidden xl:block sticky top-6" style={{ width: 340 }} aria-label="Sidebar with alerts, quick stats, and correlation matrix">
      {/* Alerts */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-(--text-high) tracking-[-0.2px]">Alerts</h3>
          <span className="text-xs text-(--text-low)">{alerts.length}</span>
        </div>
        <ul className="space-y-2">
          {alerts.length === 0 && (
            <li className="text-xs text-(--text-low)">No alerts</li>
          )}
          {alerts.map((al, idx) => (
            <li
              key={`${al.kind}-${al.id}-${idx}`}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-transform hover:translate-x-0.5 ${al.kind !== 'system' ? 'signal-pulse' : ''}`}
              style={{ background: 'var(--bg-glass-heavy)', border: '1px solid var(--border-subtle)' }}
              onClick={() => al.kind !== 'system' && onAlertClick?.(al.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-(--bg-alt) text-(--text-med)" aria-hidden>
                  {al.symbol}
                </span>
                <span className="text-sm text-(--text-high)">{al.text}</span>
              </div>
              <span className="text-[10px] uppercase tracking-wide text-(--text-low)">
                {al.kind}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Stats */}
      <div className="glass-card p-4 mb-4">
        <h3 className="text-sm font-bold text-(--text-high) mb-3 tracking-[-0.2px]">Quick Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="text-[11px] text-(--text-low) mb-1">Top Gainers (24h)</div>
            <div className="flex flex-wrap gap-2">
              {quick.topGainers.map(a => (
                <span key={a.asset.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green-up)' }}>
                  {a.asset.symbol} {formatPercentage(a.currentPrice.changePercent24h)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-(--text-low) mb-1">Top Losers (24h)</div>
            <div className="flex flex-wrap gap-2">
              {quick.topLosers.map(a => (
                <span key={a.asset.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red-down)' }}>
                  {a.asset.symbol} {formatPercentage(a.currentPrice.changePercent24h)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-(--text-low) mb-1">Momentum Leaders</div>
            <div className="flex flex-wrap gap-2">
              {quick.topMomentum.map(a => (
                <span key={a.asset.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)' }}>
                  {a.asset.symbol} {a.signal.momentum}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix (collapsible) */}
      {marketOverview && Object.keys(marketOverview.correlationMatrix).length > 0 && (
        <div className="glass-card p-4">
          <button
            className="w-full flex items-center justify-between text-left"
            onClick={() => setShowCorrelation(v => !v)}
            aria-expanded={showCorrelation}
            aria-controls="corr-panel"
          >
            <span className="text-sm font-bold text-(--text-high) tracking-[-0.2px]">Correlation Matrix</span>
            <span className="text-(--text-low)">{showCorrelation ? '▾' : '▸'}</span>
          </button>
          {showCorrelation && (
            <div id="corr-panel" className="mt-3 overflow-x-auto max-h-[420px]">
              <table className="w-full text-[11px]">
                <thead>
                  <tr>
                    <th className="text-left text-(--text-low) p-2"></th>
                    {Object.keys(marketOverview.correlationMatrix).map(symbol => (
                      <th key={symbol} className="text-center text-(--text-low) p-2">{symbol}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(marketOverview.correlationMatrix).map(([symbol1, correlations]) => (
                    <tr key={symbol1}>
                      <td className="text-(--text-high) font-bold p-2">{symbol1}</td>
                      {Object.entries(correlations).map(([symbol2, correlation]) => {
                        const corrValue = correlation as number;
                        const bg =
                          corrValue > 0.7 ? 'bg-green-600' :
                          corrValue > 0.4 ? 'bg-green-700' :
                          corrValue > 0 ? 'bg-gray-700' :
                          corrValue > -0.4 ? 'bg-gray-700' :
                          corrValue > -0.7 ? 'bg-red-700' : 'bg-red-600';
                        return (
                          <td key={symbol2} className={`text-center p-2 ${bg} text-white`}>
                            {corrValue.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-[10px] text-(--text-low)">
                1.0 = perfect positive, -1.0 = perfect negative, 0 = none
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
