import { NextResponse } from 'next/server';
import axios from 'axios';
import { CoinGeckoMarketData } from '@/types';
import { TOP_ASSETS } from '@/lib/api';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CG_API_KEY = process.env.COINGECKO_API_KEY || process.env.X_CG_API_KEY || process.env.X_CG_DEMO_API_KEY;

type CacheKey = string; // ids list
type CacheEntry = { timestamp: number; data: CoinGeckoMarketData[] };
const CACHE_TTL_MS = 60_000;
const cache = new Map<CacheKey, CacheEntry>();

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 400): Promise<T> {
  try { return await fn(); } catch (e) { if (retries <= 0) throw e; await new Promise(r => setTimeout(r, delay)); return withRetry(fn, retries - 1, delay * 2); }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids') || TOP_ASSETS.map(a => a.id).join(',');
    const key: CacheKey = idsParam;

    const now = Date.now();
    const hit = cache.get(key);
    if (hit && (now - hit.timestamp) < CACHE_TTL_MS) {
      return NextResponse.json({ source: 'cache', data: hit.data });
    }

    const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean).join(',');
    const headers = CG_API_KEY ? { 'x-cg-pro-api-key': CG_API_KEY } : undefined;

    const data = await withRetry(async () => {
      const response = await axios.get<CoinGeckoMarketData[]>(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids,
          order: 'market_cap_desc',
          per_page: Math.min(ids.split(',').length || 5, 250),
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        },
        headers,
        timeout: 10_000
      });
      return response.data;
    }, 2);

    cache.set(key, { timestamp: now, data });
    return NextResponse.json({ source: 'live', data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch market data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
