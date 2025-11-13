"use client";

import { RiskMetrics } from '@/types';
import { useMemo, useState } from 'react';

export default function RiskRegimeCard({ risk }: { risk?: RiskMetrics }) {
  const score = Math.max(0, Math.min(100, risk?.score ?? 0));
  const updatedAgo = useMemo(() => {
    const t = risk?.updatedAt ? Math.max(0, Math.floor((Date.now() - risk.updatedAt) / 1000)) : undefined;
    return t;
  }, [risk?.updatedAt]);

  // Color bands for score
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#10B981';
  const label = score >= 70 ? 'Hot (High Risk)' : score >= 40 ? 'Caution' : 'Calm';
  const [showHelp, setShowHelp] = useState(false);

  // Simple radial gauge using conic-gradient
  const gaugeStyle: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.08) 0)`
  };

  return (
    <div className="glass-card p-4" aria-label="Leverage risk regime">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-(--text-high) tracking-[-0.2px]">Leverage Risk</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--bg-alt)', color }} aria-label={`Regime: ${label}`}>{label}</span>
          <button
            type="button"
            className="text-[10px] px-1.5 py-0.5 rounded-md border"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-high)', background: 'var(--bg-glass)' }}
            onClick={() => setShowHelp(v => !v)}
            aria-expanded={showHelp}
            aria-controls="risk-help"
            title={showHelp ? 'Hide explanation' : 'Show explanation'}
          >
            ?
          </button>
        </div>
        {typeof updatedAgo === 'number' && (
          <span className="text-[10px] text-(--text-low)">Updated {updatedAgo}s ago</span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" aria-label={`Risk score ${score} out of 100`}>
          <div style={gaugeStyle} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-extrabold" style={{ color }}>{score}</div>
              <div className="text-[10px] text-(--text-low)">0 = calm • 100 = hot</div>
            </div>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-3">
          <Metric label="OI Pressure" value={risk?.components.oiPressure} color="#60A5FA" titleText="How elevated futures open interest is versus recent history. High = many positions open." />
          <Metric label="Funding Heat" value={risk?.components.fundingHeat} color="#F472B6" titleText="How positive the perp funding rate is. High = crowded longs paying shorts." />
          <Metric label="Accel" value={risk?.components.accel} color="#34D399" titleText="Recent speed of OI change. Positive = OI rising fast." />
        </div>
      </div>

      {risk?.details && (
        <div className="mt-3 text-[10px] text-(--text-low)">
          z(OI) avg: {fmt(risk.details.oiZAvg)} • z(Funding) avg: {fmt(risk.details.fundingZAvg)} • OI accel: {fmt(risk.details.oiAccelAvg)}
        </div>
      )}

      {/* How to read / legend */}
      {(
        <div id="risk-help" className="mt-3 p-3 rounded-md text-[11px]" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)', display: showHelp ? 'block' : 'none' }}>
          <div className="font-semibold mb-1">How to read</div>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>Score</strong> (0–100): higher means more crowded leverage and a greater chance of a sharp pullback.
            </li>
            <li>
              <strong>OI Pressure</strong>: open interest vs recent average (Z-score). High = many positions on.
            </li>
            <li>
              <strong>Funding Heat</strong>: positive funding indicates long bias. High and rising funding = complacent longs.
            </li>
            <li>
              <strong>Accel</strong>: how quickly OI is rising. Positive accel + high OI/funding = froth building.
            </li>
            <li>
              <strong>Rule of thumb</strong>: if OI Pressure and Funding Heat are both ≥ 70 and Accel ≥ 50, downside risk is elevated.
            </li>
          </ul>
          <div className="mt-2 opacity-70">Informational only — not financial advice.</div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color, titleText }: { label: string; value?: number; color: string; titleText?: string }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div>
      <div className="text-[11px] text-(--text-low) mb-1" title={titleText}>{label}</div>
      <div className="h-2.5 w-full rounded-full" style={{ background: 'var(--bg-alt)' }}>
        <div className="h-2.5 rounded-full" style={{ width: `${v}%`, background: color }} />
      </div>
      <div className="text-[10px] text-(--text-med) mt-1">{v}</div>
    </div>
  );
}

function fmt(n?: number) {
  return typeof n === 'number' && Number.isFinite(n) ? n.toFixed(2) : '—';
}
