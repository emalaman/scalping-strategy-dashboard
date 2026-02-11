import React from 'react';

export default function Footer({ filters }) {
  return (
    <footer className="text-center py-8 text-gray-500 text-sm mt-12 border-t border-gray-800">
      <p className="mb-2">
        Data from Polymarket Gamma API · Filter: Spread {(filters.minSpread * 100).toFixed(1)}%-{(filters.maxSpread * 100).toFixed(1)}% · Vol &gt; {filters.minVolume.toLocaleString()}
      </p>
      <p>
        Made by Emil_IA · Auto-refresh every 5 minutes ·
        <a href="https://github.com/emalaman/scalping-strategy-dashboard" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline ml-1">
          GitHub
        </a>
      </p>
    </footer>
  );
}
