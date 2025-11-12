import { NextResponse } from 'next/server';

// Alternative.me Fear & Greed API (crypto)
// Docs: https://alternative.me/crypto/fear-and-greed-index/
// Endpoint returns: { name, data: [{ value, value_classification, timestamp, ... }], }
const FNG_API = 'https://api.alternative.me/fng/';

interface RawFNGItem {
  value: string; // numeric string
  value_classification: string;
  timestamp: string; // unix seconds as string
}

interface RawFNGResponse {
  data: RawFNGItem[];
}

type CacheEntry = { timestamp: number; data: RawFNGItem };
const CACHE_TTL_MS = 60_000; // 60s
let cache: CacheEntry | null = null;

async function fetchFearGreed(): Promise<RawFNGItem> {
  const resp = await fetch(FNG_API, { next: { revalidate: 60 } });
  if (!resp.ok) throw new Error(`FNG API error: ${resp.status}`);
  const json: RawFNGResponse = await resp.json();
  if (!json.data || json.data.length === 0) throw new Error('No FNG data');
  return json.data[0];
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 400): Promise<T> {
  try { return await fn(); } catch (e) {
    if (retries <= 0) throw e;
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function GET() {
  try {
    const now = Date.now();
    if (cache && (now - cache.timestamp) < CACHE_TTL_MS) {
      const cached = cache.data;
      return NextResponse.json({ source: 'cache', data: normalize(cached) });
    }
    const raw = await withRetry(fetchFearGreed, 2);
    cache = { timestamp: now, data: raw };
    return NextResponse.json({ source: 'live', data: normalize(raw) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch fear-greed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalize(item: RawFNGItem) {
  return {
    value: Number(item.value),
    classification: item.value_classification,
    updatedAt: Number(item.timestamp) * 1000
  };
}
