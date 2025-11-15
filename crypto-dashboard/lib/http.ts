// Lightweight resilient HTTP helpers for server-side fetching
// - Timeout with AbortController
// - Retries with exponential backoff and jitter
// - Optional host failover (e.g., Binance api1/api2)

export type ResilientFetchOptions = {
  timeoutMs?: number;
  retries?: number;
  backoffBaseMs?: number;
  headers?: Record<string, string>;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(resource: string, options: RequestInit & { timeoutMs?: number }) {
  const { timeoutMs, ...init } = options;
  if (!timeoutMs) return fetch(resource, init);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(resource, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function resilientFetchJson<T = any>(
  url: string,
  options: ResilientFetchOptions = {},
  altHosts?: string[]
): Promise<T> {
  const {
    timeoutMs = 8_000,
    retries = 2,
    backoffBaseMs = 400,
    headers = {},
  } = options;

  const userHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'CryptoDashboard/1.0 (+https://github.com/CalfCrusher)'
  };
  Object.assign(userHeaders, headers);

  // Build list of candidate URLs with host failover if provided
  const candidates: string[] = [url];
  if (altHosts && altHosts.length > 0) {
    try {
      const u = new URL(url);
      for (const host of altHosts) {
        if (host && host !== u.host) {
          const alt = new URL(url);
          alt.host = host;
          candidates.push(alt.toString());
        }
      }
    } catch {
      // If URL parsing fails, ignore alt hosts
    }
  }

  let attempt = 0;
  let lastError: unknown = null;

  for (const candidate of candidates) {
    attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await withTimeout(candidate, { method: 'GET', headers: userHeaders, timeoutMs });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as T;
      } catch (e) {
        lastError = e;
        attempt += 1;
        if (attempt > retries) break;
        const jitter = Math.random() * 100;
        const backoff = backoffBaseMs * Math.pow(2, attempt - 1) + jitter;
        await sleep(backoff);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Resilient fetch failed');
}

// Simple in-memory TTL cache for server runtime
export class TtlCache<V> {
  private store = new Map<string, { ts: number; v: V }>();
  constructor(private ttlMs: number) {}
  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.ts > this.ttlMs) {
      this.store.delete(key);
      return undefined;
    }
    return hit.v;
  }
  set(key: string, v: V) { this.store.set(key, { ts: Date.now(), v }); }
}

// Concurrency-limited mapper
export async function mapPool<I, O>(items: I[], limit: number, worker: (item: I, idx: number) => Promise<O>): Promise<O[]> {
  const results: O[] = new Array(items.length);
  let i = 0;
  const workers: Promise<void>[] = [];

  async function run() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  }

  const c = Math.max(1, Math.min(limit, items.length));
  for (let k = 0; k < c; k++) workers.push(run());
  await Promise.all(workers);
  return results;
}
