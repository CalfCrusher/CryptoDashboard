import { NextResponse } from 'next/server';

// Binance USDⓈ-M Futures endpoints
const BINANCE_FAPI = 'https://fapi.binance.com';

type Symbol = 'BTCUSDT' | 'ETHUSDT';

interface Snapshot {
  t: number; // ms
  oi: number; // open interest (base units)
  fundingRate: number; // last funding rate (per 8h)
}

interface EnrichedSnapshot extends Snapshot {
  oiZ?: number;
  fundingZ?: number;
  oiAccel?: number; // relative change vs N steps back
}

// Simple in-memory history per server instance
const HISTORY: Record<Symbol, Snapshot[]> = { BTCUSDT: [], ETHUSDT: [] };
let lastUpdate = 0;
const TTL_MS = 60_000; // refresh every 60s
const MAX_POINTS = 240; // keep ~4h at 1m cadence

async function fetchOpenInterest(symbol: Symbol): Promise<number> {
  const url = `${BINANCE_FAPI}/fapi/v1/openInterest?symbol=${symbol}`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`OI ${symbol} ${resp.status}`);
  const json = await resp.json();
  const v = Number(json?.openInterest);
  return Number.isFinite(v) ? v : NaN;
}

async function fetchFundingRate(symbol: Symbol): Promise<number> {
  // Get last known funding rate
  const url = `${BINANCE_FAPI}/fapi/v1/fundingRate?symbol=${symbol}&limit=1`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`FR ${symbol} ${resp.status}`);
  const arr = await resp.json();
  const item = Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1] : undefined;
  const v = Number(item?.fundingRate);
  return Number.isFinite(v) ? v : NaN;
}

function pushHistory(symbol: Symbol, s: Snapshot) {
  const list = HISTORY[symbol];
  // de-dup if same minute
  if (list.length > 0 && Math.abs(list[list.length - 1].t - s.t) < 30_000) return;
  list.push(s);
  if (list.length > MAX_POINTS) list.splice(0, list.length - MAX_POINTS);
}

function mean(arr: number[]): number { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }
function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const v = mean(arr.map(x => (x - m) ** 2));
  return Math.sqrt(v);
}
function zScore(series: number[], window = 60): number | undefined {
  if (!series.length) return undefined;
  const w = series.slice(-window);
  if (w.length < 10) return undefined;
  const last = w[w.length - 1];
  const m = mean(w);
  const sd = stddev(w);
  if (sd === 0) return 0;
  return (last - m) / sd;
}

function accel(series: number[], back = 3): number | undefined {
  if (series.length <= back) return undefined;
  const a = series[series.length - 1];
  const b = series[series.length - 1 - back];
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return undefined;
  return (a - b) / Math.abs(b);
}

function clip(x: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, x)); }

function toRiskScore(oiZAvg?: number, frZAvg?: number, oiAccelAvg?: number) {
  const z1 = Number.isFinite(oiZAvg as number) ? clip(oiZAvg as number, -3, 3) : 0;
  const z2 = Number.isFinite(frZAvg as number) ? clip(frZAvg as number, -3, 3) : 0;
  const a = Number.isFinite(oiAccelAvg as number) ? clip(oiAccelAvg as number, -0.2, 0.2) : 0; // cap +/-20%
  // Map z in [-3,3] to [0,100] where higher => riskier
  const s1 = ((z1 + 3) / 6) * 100;
  const s2 = ((z2 + 3) / 6) * 100;
  const sA = ((a + 0.2) / 0.4) * 100; // accel in [-0.2,0.2]
  const score = 0.5 * s1 + 0.4 * s2 + 0.1 * sA;
  return Math.round(clip(score, 0, 100));
}

async function refreshIfNeeded(): Promise<void> {
  const now = Date.now();
  if (now - lastUpdate < TTL_MS && HISTORY.BTCUSDT.length && HISTORY.ETHUSDT.length) return;
  const [btcOi, btcFr, ethOi, ethFr] = await Promise.all([
    fetchOpenInterest('BTCUSDT').catch(() => NaN),
    fetchFundingRate('BTCUSDT').catch(() => NaN),
    fetchOpenInterest('ETHUSDT').catch(() => NaN),
    fetchFundingRate('ETHUSDT').catch(() => NaN),
  ]);
  const snapTime = now;
  if (Number.isFinite(btcOi) && Number.isFinite(btcFr)) pushHistory('BTCUSDT', { t: snapTime, oi: btcOi, fundingRate: btcFr });
  if (Number.isFinite(ethOi) && Number.isFinite(ethFr)) pushHistory('ETHUSDT', { t: snapTime, oi: ethOi, fundingRate: ethFr });
  lastUpdate = now;
}

export async function GET() {
  try {
    await refreshIfNeeded();

    const enrich = (symbol: Symbol): EnrichedSnapshot | null => {
      const arr = HISTORY[symbol];
      if (!arr.length) return null;
      const last = arr[arr.length - 1];
      const oiSeries = arr.map(x => x.oi);
      const frSeries = arr.map(x => x.fundingRate);
      const e: EnrichedSnapshot = {
        ...last,
        oiZ: zScore(oiSeries),
        fundingZ: zScore(frSeries),
        oiAccel: accel(oiSeries, 3),
      };
      return e;
    };

    const btc = enrich('BTCUSDT');
    const eth = enrich('ETHUSDT');

    const items = [btc, eth].filter(Boolean) as EnrichedSnapshot[];
    const oiZAvg = items.length ? mean(items.map(i => i.oiZ ?? 0)) : undefined;
    const frZAvg = items.length ? mean(items.map(i => i.fundingZ ?? 0)) : undefined;
    const oiAccelAvg = items.length ? mean(items.map(i => i.oiAccel ?? 0)) : undefined;
    const score = toRiskScore(oiZAvg, frZAvg, oiAccelAvg);

    return NextResponse.json({
      source: 'derivatives',
      updatedAt: lastUpdate || Date.now(),
      assets: [
        btc ? { symbol: 'BTCUSDT', ...btc } : undefined,
        eth ? { symbol: 'ETHUSDT', ...eth } : undefined,
      ].filter(Boolean),
      aggregate: {
        oiZAvg,
        fundingZAvg: frZAvg,
        oiAccelAvg,
        riskScore: score,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch derivatives';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
