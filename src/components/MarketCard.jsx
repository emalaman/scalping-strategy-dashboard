import React from 'react';
import { formatNumber, formatPercent, formatTimeAgo, formatTimeLeft, getSpreadColor, getSideColor, getSignal } from '../utils/formatters';

export default function MarketCard({ opp }) {
  const signal = getSignal(opp.underpricedSide === 'YES' ? opp.yes : opp.underpricedPrice, opp.underpricedPrice);
  const spreadColor = getSpreadColor(opp.maxSpread);
  const targetProfit = (opp.maxSpread * 100).toFixed(1);

  return (
    <article className="bg-dark-800 rounded-lg p-5 border border-gray-700 card-hover" data-category={opp.category.replace(/\s+/g, '-')}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`badge ${signal.color}`}>{signal.text}</span>
          <span className="badge bg-gray-800 text-gray-300 border-gray-600">{opp.underpricedSide}</span>
        </div>
        <span className="text-xs text-gray-500">{formatTimeAgo(opp.updatedAt)}</span>
      </div>

      <h3 className="text-lg font-bold text-white mb-4 leading-tight line-clamp-2">{opp.question}</h3>

      {/* Prices */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`bg-dark-900 p-3 rounded border ${opp.yes < 0.5 ? 'border-blue-600' : 'border-gray-700'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-sm">YES</span>
            <span className={`font-mono ${getSideColor('YES')} font-bold`}>{formatPercent(opp.yes)}</span>
          </div>
          <div className="text-xs text-gray-500">Spread: {formatPercent(opp.yesSpread)}</div>
        </div>
        <div className={`bg-dark-900 p-3 rounded border ${opp.no < 0.5 ? 'border-pink-600' : 'border-gray-700'}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 text-sm">NO</span>
            <span className={`font-mono ${getSideColor('NO')} font-bold`}>{formatPercent(opp.no)}</span>
          </div>
          <div className="text-xs text-gray-500">Spread: {formatPercent(opp.noSpread)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-xs mb-4">
        <div className="bg-dark-900 p-2 rounded text-center border border-gray-700">
          <div className="text-gray-500">Spread</div>
          <div className={`font-bold ${spreadColor}`}>{(opp.maxSpread * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-dark-900 p-2 rounded text-center border border-gray-700">
          <div className="text-gray-400">Volume</div>
          <div className="font-bold text-white">{formatNumber(opp.volume)}</div>
        </div>
        <div className="bg-dark-900 p-2 rounded text-center border border-gray-700">
          <div className="text-gray-400">Liquidity</div>
          <div className="font-bold text-green-400">{formatNumber(opp.liquidity)}</div>
        </div>
      </div>

      {/* Time Remaining */}
      {opp.timeLeft ? (
        <div className="mb-4 text-center border-b border-gray-700 pb-3">
          <span className="text-xs text-gray-400">
            ⏱️ Ends in: <span className="font-mono text-primary-400">{formatTimeLeft(opp.timeLeft)}</span>
          </span>
        </div>
      ) : null}

      {/* Action Button */}
      <div className="pt-3">
        <button
          onClick={() => window.open(opp.marketUrl, '_blank')}
          className="w-full py-2 bg-primary-900/30 border border-primary-600 rounded hover:bg-primary-800/40 transition text-white font-semibold text-sm"
        >
          🎯 {opp.underpricedSide} at {formatPercent(opp.underpricedPrice)} → Target +{targetProfit}%
        </button>
      </div>
    </article>
  );
}
