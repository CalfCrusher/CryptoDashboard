import { NextResponse } from 'next/server';
import { fetchTopAltcoinMovers } from '@/lib/api';

// Optional API key support if provided (CoinGecko Free/Pro)
const CG_API_KEY = process.env.COINGECKO_API_KEY || process.env.X_CG_API_KEY || process.env.X_CG_DEMO_API_KEY;

// Simple in-memory cache (per server instance)
import { CoinGeckoMarketData } from '@/types';
type CacheEntry = { timestamp: number; data: CoinGeckoMarketData[] };
const CACHE_TTL_MS = 60_000; // 60s
let cache: CacheEntry | null = null;

// Basic retry helper with exponential backoff
async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 400): Promise<T> {
	try {
		return await fn();
	} catch (e) {
		if (retries <= 0) throw e;
		await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, (2 - retries))));
		return withRetry(fn, retries - 1, baseDelayMs);
	}
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const limit = Number(url.searchParams.get('limit') || '12');
		const perPage = Number(url.searchParams.get('perPage') || '250');
		const absolute = url.searchParams.get('absolute') !== 'false';
		const minCap = Number(url.searchParams.get('minMarketCap') || '150000000');
		const minVol = Number(url.searchParams.get('minVolume') || '10000000');

		// Serve from cache if fresh and params match the default set (simplification)
		const now = Date.now();
		if (cache && (now - cache.timestamp) < CACHE_TTL_MS) {
			return NextResponse.json({ source: 'cache', data: cache.data });
		}

		const data: CoinGeckoMarketData[] = await withRetry(() => fetchTopAltcoinMovers({
			limit,
			perPage,
			absoluteChange: absolute,
			minMarketCapUSD: minCap,
			minVolume24hUSD: minVol,
		}), 2);

		cache = { timestamp: now, data };

		return NextResponse.json({ source: 'live', data }, { headers: CG_API_KEY ? { 'x-cg-api-key-used': 'true' } : undefined });
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Failed to fetch movers';
			return NextResponse.json({ error: message }, { status: 500 });
	}
}

