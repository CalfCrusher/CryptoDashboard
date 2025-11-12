'use client';

import { useEffect, useState } from 'react';
import { CoinGeckoMarketData } from '@/types';
// Fetch via server-side API route to avoid client-side CORS and add retries/caching
import { formatPrice } from '@/lib/analysis';

interface TopAltcoinMoversProps {
  title?: string;
  limit?: number;
  lastUpdate?: number; // dashboard tick to re-fetch on cadence
}

export default function TopAltcoinMovers({ title = 'Top Altcoin Movers', limit = 12, lastUpdate }: TopAltcoinMoversProps) {
  const [items, setItems] = useState<CoinGeckoMarketData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Fetch via server-side proxy route to avoid client-side CORS/Cloudflare issues
        const resp = await fetch(`/api/top-movers?limit=${limit}`);
        if (!mounted) return;
        if (!resp.ok) throw new Error('Failed to load');
        const json = await resp.json();
        setItems(json.data ?? []);
        setError(null);
      } catch {
        if (!mounted) return;
        setError('Failed to load movers');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [limit, lastUpdate]);

  return (
    <section aria-label="Top Altcoin Movers" className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-(--text-high) tracking-[-0.2px]">{title}</h3>
        <span className="text-xs text-(--text-low)">{items?.length ?? 0}</span>
      </div>
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 rounded-md skeleton h-[72px]" />
          ))}
        </div>
      )}
      {!loading && error && (
        <div className="text-xs text-red-400">{error}</div>
      )}
      {!loading && !error && items && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((c) => {
            const pct = c.price_change_percentage_24h ?? 0;
            const up = pct >= 0;
            return (
              <div key={c.id} className="p-3 rounded-md border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-glass)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="text-(--text-high) font-bold text-sm tracking-[-0.25px]">{c.symbol.toUpperCase()}</div>
                    <div className="text-(--text-low) text-[11px]">{c.name}</div>
                  </div>
                  <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{up ? '+' : ''}{pct.toFixed(2)}%</div>
                </div>
                <div className="flex items-center justify-between text-[12px] text-(--text-low)">
                  <div>Price <span className="text-(--text-high) font-semibold">${formatPrice(c.current_price)}</span></div>
                  <div>Vol <span className="text-(--text-high) font-semibold">${(c.total_volume/1_000_000).toFixed(1)}M</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
