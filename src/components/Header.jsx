import React from 'react';

export default function Header({ totalCount, lastUpdate, filters, onRefresh }) {
  return (
    <header className="mb-10 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white border-b-2 border-primary-600 pb-2 inline-block">
        Scalping Strategy Dashboard
      </h1>
      <p className="text-gray-400 text-lg">
        Top <span className="text-white font-semibold">{totalCount}</span> opportunities · Spread{' '}
        <span className="text-white font-semibold">
          {(filters.minSpread * 100).toFixed(1)}%-{(filters.maxSpread * 100).toFixed(1)}%
        </span>{' '}
        · Vol &gt; <span className="text-white font-semibold">{filters.minVolume.toLocaleString()}</span>
        <br />
        Last updated: <span className="text-primary-400 font-mono">{lastUpdate}</span>
      </p>
      <div className="mt-4 flex justify-center gap-4 flex-wrap">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-primary-900/50 border border-primary-600 rounded hover:bg-primary-800/50 transition text-primary-200 font-medium"
        >
          🔄 Refresh now
        </button>
      </div>
    </header>
  );
}
