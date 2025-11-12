'use client';

import { AssetAnalysis } from '@/types';
import { formatPrice, formatPercentage } from '@/lib/analysis';

interface SignalTableProps {
  analyses: AssetAnalysis[];
}

export default function SignalTable({ analyses }: SignalTableProps) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
      <h2 className="text-xl font-bold text-white mb-4">Trading Signals</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
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

            return (
              <tr key={asset.id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="py-3 px-2">
                  <div className="font-bold text-white">{asset.symbol}</div>
                  <div className="text-xs text-gray-400">{asset.name}</div>
                </td>
                <td className="py-3 px-2">
                  <div className={`font-bold ${signalColor}`}>
                    {signal.direction}
                  </div>
                  <div className="text-xs text-gray-400">{signal.strength}</div>
                </td>
                <td className="text-right py-3 px-2 text-white font-mono">
                  ${formatPrice(currentPrice.price)}
                </td>
                <td className="text-right py-3 px-2 text-red-400 font-mono">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.stopLoss)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 text-green-400 font-mono">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit1)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 text-green-400 font-mono">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit2)}` : '-'}
                </td>
                <td className="text-right py-3 px-2 text-green-400 font-mono">
                  {signal.direction !== 'WAIT' ? `$${formatPrice(riskManagement.takeProfit3)}` : '-'}
                </td>
                <td className={`text-center py-3 px-2 font-bold ${rrColor}`}>
                  {signal.direction !== 'WAIT' ? `1:${riskManagement.riskRewardRatio.toFixed(2)}` : '-'}
                </td>
                <td className="text-center py-3 px-2">
                  <div className={`inline-block px-2 py-1 rounded ${
                    signal.confluenceCount >= 7 ? 'bg-green-600' :
                    signal.confluenceCount >= 5 ? 'bg-yellow-600' :
                    'bg-gray-600'
                  } text-white text-xs font-bold`}>
                    {signal.confluenceCount}
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <div className="text-white font-bold">
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
