'use client';

import { AssetAnalysis, MarketOverview } from '@/types';
import { formatPercentage } from '@/lib/analysis';
import { useEffect, useMemo, useRef, useState } from 'react';

interface MarketInsightsProps {
  assets: AssetAnalysis[];
  marketOverview: MarketOverview | null;
  missedUpdates: number;
  onAlertClick?: (assetId: string) => void;
}

/**
 * Full-width insights row: Alerts, Quick Stats, and Collapsible Correlation
 * Responsive and horizontally flowing — no sidebar.
 */
export default function MarketInsights({ assets, marketOverview, missedUpdates, onAlertClick }: MarketInsightsProps) {
  const [showCorrelation, setShowCorrelation] = useState(false);
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const deliveredRef = useRef<Map<string, number>>(new Map()); // key -> timestamp

  // On mount, detect notification support and current permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifSupported(true);
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Tunable thresholds for alerting
  const ALERTS = {
    strongMove24h: 8,          // % 24h move
    momentumHigh: 60,          // momentum score (tuned)
    confluenceHigh: 6,         // count
    recentSpikePct: 0.5,       // % between last two 5m closes (tuned)
  } as const;

  const alerts = useMemo(() => {
    type Kind = 'system' | 'strong-signal' | 'big-move' | 'momentum' | 'confluence' | 'spike-up' | 'spike-down';
    const items: Array<{ id: string; symbol: string; kind: Kind; text: string; priority: number }>= [];
    assets.forEach(a => {
      // Strong BUY/SELL
      if (a.signal.strength.includes('STRONG')) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'strong-signal', text: `${a.signal.strength} ${a.signal.direction}`, priority: 4 });
      }
      // Big 24h move
      const pct24 = a.currentPrice.changePercent24h;
      if (Math.abs(pct24) >= ALERTS.strongMove24h) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'big-move', text: `${pct24 >= 0 ? '+' : ''}${pct24.toFixed(2)}% / 24h`, priority: 2 });
      }
      // High momentum
      if (a.signal.momentum >= ALERTS.momentumHigh) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'momentum', text: `Momentum ${a.signal.momentum}`, priority: 3 });
      }
      // High confluence
      if (a.signal.confluenceCount >= ALERTS.confluenceHigh) {
        items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'confluence', text: `Confluence ${a.signal.confluenceCount}/8`, priority: 3 });
      }
      // Recent spike: prefer 5m metric if available; fallback to sparkline diff
      if (typeof a.recent5mChangePct === 'number') {
        const changePct = a.recent5mChangePct;
        if (changePct >= ALERTS.recentSpikePct) {
          items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'spike-up', text: `Spike +${changePct.toFixed(2)}% (5m)`, priority: 6 });
        } else if (changePct <= -ALERTS.recentSpikePct) {
          items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'spike-down', text: `Spike ${changePct.toFixed(2)}% (5m)`, priority: 6 });
        }
      } else {
        const s = a.sparkline;
        if (s && s.length >= 2) {
          const prev = s[s.length - 2];
          const last = s[s.length - 1];
          if (prev > 0) {
            const changePct = ((last - prev) / prev) * 100;
            if (changePct >= ALERTS.recentSpikePct) {
              items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'spike-up', text: `Spike +${changePct.toFixed(2)}% (recent)`, priority: 5 });
            } else if (changePct <= -ALERTS.recentSpikePct) {
              items.push({ id: a.asset.id, symbol: a.asset.symbol, kind: 'spike-down', text: `Spike ${changePct.toFixed(2)}% (recent)`, priority: 5 });
            }
          }
        }
      }
    });
    if (missedUpdates > 0) {
      items.push({ id: 'system-missed', symbol: 'SYS', kind: 'system', text: `Missed updates: ${missedUpdates}`, priority: 6 });
    }
    return items.sort((a,b) => b.priority - a.priority).slice(0, 20);
  }, [assets, missedUpdates]);

  // Notify on new alerts (deduped with cooldown)
  useEffect(() => {
    if (!notifSupported || notifPermission !== 'granted') return;
    const now = Date.now();
    const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

    alerts.forEach(al => {
      const key = `${al.kind}:${al.id}:${al.text}`;
      const last = deliveredRef.current.get(key) || 0;
      if (now - last < COOLDOWN_MS) return; // still cooling down
      try {
        // Fire and record
        const title = `${al.symbol} — ${al.kind.replace('-', ' ').toUpperCase()}`;
        const body = al.text;
        new Notification(title, {
          body,
          // optional icon could be added here from /public if desired
        });
        deliveredRef.current.set(key, now);
      } catch {
        // ignore notification errors
      }
    });
  }, [alerts, notifSupported, notifPermission]);

  const quick = useMemo(() => {
    const sortedByChange = [...assets].sort((a,b) => b.currentPrice.changePercent24h - a.currentPrice.changePercent24h);
    const positives = sortedByChange.filter(a => a.currentPrice.changePercent24h > 0);
    const negatives = sortedByChange.filter(a => a.currentPrice.changePercent24h < 0).sort((a,b) => a.currentPrice.changePercent24h - b.currentPrice.changePercent24h);
    const sortedByMomentum = [...assets].sort((a,b) => b.signal.momentum - a.signal.momentum);
    return {
      topGainers: positives.slice(0,3),
      topLosers: negatives.slice(0,3),
      topMomentum: sortedByMomentum.slice(0,3)
    };
  }, [assets]);

  return (
    <section aria-label="Market insights" className="space-y-6">
      {/* Alerts Row — only render when there are alerts */}
      {alerts.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-(--text-high) tracking-[-0.2px]">Alerts</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--text-low)">{alerts.length}</span>
              {notifSupported && notifPermission !== 'granted' && (
                <button
                  type="button"
                  className="text-[10px] px-2 py-1 rounded-md border"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-high)', background: 'var(--bg-glass)' }}
                  onClick={async () => {
                    try {
                      const perm = await Notification.requestPermission();
                      setNotifPermission(perm);
                    } catch {
                      // ignore
                    }
                  }}
                  title="Enable desktop notifications"
                >
                  Enable desktop alerts
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" role="list">
            {alerts.map((al, idx) => {
              // Badge color per alert type
              const styles: Record<string, {bg:string; fg:string; badge:string}> = {
                'spike-up': { bg: 'rgba(16,185,129,0.18)', fg: '#10B981', badge: 'Spike' },
                'spike-down': { bg: 'rgba(239,68,68,0.18)', fg: '#EF4444', badge: 'Spike' },
                'momentum': { bg: 'rgba(6,182,212,0.18)', fg: '#06B6D4', badge: 'Momentum' },
                'confluence': { bg: 'rgba(251,191,36,0.18)', fg: '#F59E0B', badge: 'Confluence' },
                'strong-signal': { bg: 'rgba(59,130,246,0.18)', fg: '#3B82F6', badge: 'Signal' },
                'big-move': { bg: 'rgba(147,51,234,0.18)', fg: '#A855F7', badge: '24h' },
                'system': { bg: 'rgba(255,214,10,0.18)', fg: '#FFD60A', badge: 'System' },
              };
              const s = styles[al.kind] || { bg: 'var(--bg-glass-heavy)', fg: 'var(--text-high)', badge: 'Alert' };
              return (
                <button
                  key={`${al.kind}-${al.id}-${idx}`}
                  role="listitem"
                  onClick={() => al.kind !== 'system' && onAlertClick?.(al.id)}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap text-xs font-semibold transition-transform ${al.kind !== 'system' ? 'signal-pulse' : ''}`}
                  style={{ background: s.bg, border: '1px solid var(--border-subtle)', color: s.fg }}
                >
                  <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>{s.badge}</span>
                  <span className="opacity-80 mr-2 text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--bg-alt)', color: 'var(--text-med)' }}>{al.symbol}</span>
                  <span style={{ color: 'var(--text-high)' }}>{al.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[11px] text-(--text-low) mb-2">Top Gainers (24h)</div>
            <div className="flex flex-wrap gap-2">
              {quick.topGainers.length === 0 ? (
                <span className="text-xs text-(--text-low)">No positive movers</span>
              ) : (
                quick.topGainers.map(a => (
                  <span key={a.asset.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--green-up)' }}>
                    {a.asset.symbol} {formatPercentage(a.currentPrice.changePercent24h)}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-(--text-low) mb-2">Top Losers (24h)</div>
            <div className="flex flex-wrap gap-2">
              {quick.topLosers.length === 0 ? (
                <span className="text-xs text-(--text-low)">No negative movers</span>
              ) : (
                quick.topLosers.map(a => (
                  <span key={a.asset.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red-down)' }}>
                    {a.asset.symbol} {formatPercentage(a.currentPrice.changePercent24h)}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-(--text-low) mb-2">Momentum Leaders</div>
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

      {/* Correlation Matrix (collapsible, full-width) */}
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
            <div id="corr-panel" className="mt-3 overflow-x-auto">
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
              <div className="mt-2 text-[10px] text-(--text-low)">1.0 = perfect positive, -1.0 = perfect negative, 0 = none</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
