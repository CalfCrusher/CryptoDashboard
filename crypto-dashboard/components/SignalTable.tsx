'use client';

import { AssetAnalysis } from '@/types';
import { formatPrice, formatPercentage } from '@/lib/analysis';
import { getAssetIcon } from '@/lib/iconMap';

interface SignalTableProps {
  analyses: AssetAnalysis[];
}

export default function SignalTable({ analyses }: SignalTableProps) {
  return (
    <div className="glass-card p-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-(--text-high) mb-4 tracking-[-0.5px]">Momentum Signals</h2>
      <table className="w-full text-sm data-table">
        <thead>
          <tr className="text-(--text-low) border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <th className="text-left py-3 px-2">Asset</th>
            <th className="text-left py-3 px-2">Signal</th>
            <th className="text-right py-3 px-2">Entry</th>
            <th className="text-right py-3 px-2">Stop Loss</th>
            <th className="text-right py-3 px-2">TP1</th>
            <th className="text-right py-3 px-2">TP2</th>
            <th className="text-right py-3 px-2">TP3</th>
            <th className="text-center py-3 px-2">R:R</th>
            <th className="text-center py-3 px-2">Confluence</th>
            <th className="text-center py-3 px-2">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((analysis) => {
            const { asset, signal, riskManagement, currentPrice } = analysis;
            
            const signalColor = 
              signal.direction === 'LONG' ? 'text-green-500' :
              signal.direction === 'SHORT' ? 'text-red-500' :
              'text-gray-400';

            const rrColor = 
              riskManagement.riskRewardRatio >= 2 ? 'text-green-500' :
              riskManagement.riskRewardRatio >= 1.5 ? 'text-yellow-500' :
              'text-red-500';

            const Icon = getAssetIcon(asset.symbol);
            return (
              <tr
                key={asset.id}
                className="border-b transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2 font-bold text-(--text-high)">
                    <span className="opacity-70"><Icon aria-label={`${asset.symbol} icon`} /></span>
                    {asset.symbol}
                  </div>
                  <div className="text-xs text-(--text-low)">{asset.name}</div>
                </td>
                <td className="py-3 px-2">
                  <div className={`font-bold ${signalColor}`}>
                    {signal.direction === 'WAIT' ? 'NO SETUP' : signal.direction}
                  </div>
                  <div className="mt-1">
                    {signal.direction === 'WAIT' ? (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold tracking-wide"
                        style={{ background: 'var(--neutral)', color: '#0F0F23' }}
                        title="Waiting for conditions — not a trade signal"
                      >
                        Waiting
                      </span>
                    ) : (
                      <span className="text-xs text-(--text-low)">{signal.strength}</span>
                    )}
                  </div>
                </td>
                <td className="text-right py-3 px-2 text-(--text-high) font-mono">
                  {signal.direction === 'WAIT' ? '—' : `$${formatPrice(currentPrice.price)}`}
                </td>
                <td className="text-right py-3 px-2 font-mono text-red-500">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.stopLoss)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 font-mono text-green-500">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit1)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 font-mono text-green-500">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit2)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 font-mono text-green-500">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit3)}` : '-'}
                </td>
                <td className={`text-center py-3 px-2 font-bold ${rrColor}`}>
                  {signal.direction !== 'WAIT' ? `1:${riskManagement.riskRewardRatio.toFixed(2)}` : '-'}
                </td>
                <td className="text-center py-3 px-2">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold tracking-wide`}
                    style={{
                      background: signal.confluenceCount >= 7
                        ? 'linear-gradient(90deg,#00D084,#10B981)'
                        : signal.confluenceCount >= 5
                        ? 'linear-gradient(90deg,#FFD60A,#FBBF24)'
                        : 'var(--neutral)',
                      color: '#fff'
                    }}
                  >
                    {signal.confluenceCount}
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="text-(--text-high) font-bold">
                    {signal.confidenceScore}/10
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
