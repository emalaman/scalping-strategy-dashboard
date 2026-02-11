const fs = require('fs');

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toLocaleString() || '0';
}

function formatPercent(num) {
  return (num * 100).toFixed(2) + '%';
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getSpreadColor(spread) {
  if (spread >= 0.025) return 'text-neon-green'; // 2.5%+ green
  if (spread >= 0.02) return 'text-yellow-400'; // 2%+ yellow
  return 'text-orange-400'; // 1.5%+ orange
}

function getSideColor(side) {
  return side === 'YES' ? 'text-neon-blue' : 'text-neon-pink';
}

function getSignal(side, price) {
  if (price < 0.48) return { text: 'STRONG BUY', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  if (price < 0.49) return { text: 'BUY', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  if (price > 0.51) return { text: 'STRONG SELL', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  if (price > 0.5) return { text: 'SELL', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  return { text: 'NEUTRAL', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
}

function generateHTML(data) {
  const { generatedAt, opportunities, totalCount, filters } = data;
  const lastUpdate = new Date(generatedAt).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ Scalping Strategy Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            neon: {
              blue: '#00f0ff',
              pink: '#ec4899',
              green: '#10b981',
              yellow: '#fbbf24',
              orange: '#fb923c',
            },
            dark: {
              900: '#0a0a0f',
              800: '#111118',
              700: '#1a1a24',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #0a0a0f;
      color: #e5e7eb;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .neon-text {
      text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
    }
    .card-hover {
      transition: all 0.3s ease;
    }
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 240, 255, 0.15);
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-weight: 600;
      border: 1px solid;
    }
    .sparkline {
      height: 30px;
      width: 80px;
    }
    .pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  </style>
</head>
<body class="min-h-screen bg-dark-900">
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <header class="mb-10 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 neon-text bg-gradient-to-r from-neon-blue via-neon-pink to-neon-green bg-clip-text text-transparent">
        ⚡ Scalping Strategy Dashboard
      </h1>
      <p class="text-gray-400 text-lg">
        Top ${totalCount} opportunities · Spread 1.5%-20% · Vol > $50k
        <br>
        Last updated: <span class="text-neon-blue font-mono">${lastUpdate}</span>
      </p>
      <div class="mt-4 flex justify-center gap-4 flex-wrap">
        <button onclick="location.reload()" class="px-4 py-2 bg-neon-blue/20 border border-neon-blue/50 rounded-lg hover:bg-neon-blue/30 transition text-neon-blue">
          🔄 Refresh now
        </button>
      </div>
    </header>

    <!-- Strategy Explanation -->
    <div class="bg-dark-800 rounded-xl p-6 border border-dark-700 mb-10">
      <h2 class="text-xl font-bold text-white mb-4">🎯 Strategy: Scalp 1.5-3% Spreads</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <h3 class="font-bold text-neon-blue mb-2">Entry Criteria</h3>
          <ul class="text-gray-300 space-y-1">
            <li>• Volume > ${formatNumber(filters.minVolume)}</li>
            <li>• Spread 1.5% - 3%</li>
            <li>• Near expiration (<24h ideal)</li>
            <li>• High volatility categories</li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold text-neon-green mb-2">Execution</h3>
          <ul class="text-gray-300 space-y-1">
            <li>• Buy underpriced side (YES if <50%, NO if >50%)</li>
            <li>• Hold 5-30 minutes</li>
            <li>• Take profit at 1-2%</li>
            <li>• Stop loss at 1%</li>
          </ul>
        </div>
        <div>
          <h3 class="font-bold text-neon-pink mb-2">Risk Management</h3>
          <ul class="text-gray-300 space-y-1">
            <li>• 2-5% capital per trade</li>
            <li>• Max 3-5 simultaneous</li>
            <li>• Total exposure 20-30%</li>
            <li>• Monitor fees & slippage</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Opportunities -->
    ${totalCount === 0 ? `
    <div class="text-center py-20">
      <div class="text-6xl mb-4">🤔</div>
      <h3 class="text-xl font-bold text-gray-300 mb-2">No scalping opportunities right now</h3>
      <p class="text-gray-500">Spreads are too tight. Check back later when markets are volatile.</p>
    </div>
    ` : `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      ${opportunities.map(opp => {
        const signal = getSignal(opp.underpricedSide === 'YES' ? opp.yes : opp.no, opp.underpricedPrice);
        const spreadColor = getSpreadColor(opp.maxSpread);
        const targetProfit = (opp.maxSpread * 100).toFixed(1);
        return `
      <article class="bg-dark-800 rounded-xl p-5 border border-dark-700 card-hover">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="badge ${signal.color}">
              ${signal.text}
            </span>
            <span class="badge bg-dark-700 text-gray-300 border-dark-600">
              ${opp.underpricedSide}
            </span>
          </div>
          <span class="text-xs text-gray-500">${formatTimeAgo(opp.updatedAt)}</span>
        </div>
        
        <h3 class="text-lg font-bold text-white mb-4 leading-tight line-clamp-2">${opp.question}</h3>
        
        <!-- Prices -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-dark-900 p-3 rounded-lg border ${opp.yes < 0.5 ? 'border-neon-blue/50' : 'border-dark-700'}">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-400 text-sm">YES</span>
              <span class="font-mono ${getSideColor('YES')} font-bold">${formatPercent(opp.yes)}</span>
            </div>
            <div class="text-xs text-gray-500">
              Spread: ${formatPercent(opp.yesSpread)}
            </div>
          </div>
          <div class="bg-dark-900 p-3 rounded-lg border ${opp.no < 0.5 ? 'border-neon-pink/50' : 'border-dark-700'}">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-400 text-sm">NO</span>
              <span class="font-mono ${getSideColor('NO')} font-bold">${formatPercent(opp.no)}</span>
            </div>
            <div class="text-xs text-gray-500">
              Spread: ${formatPercent(opp.noSpread)}
            </div>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 text-xs mb-4">
          <div class="bg-dark-900 p-2 rounded text-center">
            <div class="text-gray-500">Spread</div>
            <div class="font-bold ${spreadColor}">${(opp.maxSpread*100).toFixed(1)}%</div>
          </div>
          <div class="bg-dark-900 p-2 rounded text-center">
            <div class="text-gray-500">Volume</div>
            <div class="font-bold text-white">${formatNumber(opp.volume)}</div>
          </div>
          <div class="bg-dark-900 p-2 rounded text-center">
            <div class="text-gray-500">Liquidity</div>
            <div class="font-bold text-neon-yellow">${formatNumber(opp.liquidity.YES + opp.liquidity.NO)}</div>
          </div>
        </div>
        
        <!-- Action Button -->
        <div class="border-t border-dark-700 pt-3">
          <button onclick="window.open('https://polymarket.com/market/${opp.id}', '_blank')" class="w-full py-2 bg-gradient-to-r from-neon-blue/20 to-neon-pink/20 border border-neon-blue/50 rounded-lg hover:from-neon-blue/30 hover:to-neon-pink/30 transition text-white font-semibold text-sm">
            🎯 ${opp.underpricedSide} at ${formatPercent(opp.underpricedPrice)} → Target +${targetProfit}%
          </button>
        </div>
      </article>
      `}).join('')}
    </div>
    `}
    
    <!-- Footer -->
    <footer class="text-center py-8 text-gray-500 text-sm mt-12 border-t border-dark-800">
      <p class="mb-2">
        Data from Polymarket Gamma API · Filter: Spread ${filters.minSpread*100}%-${filters.maxSpread*100}% · Vol > ${formatNumber(filters.minVolume)}
      </p>
      <p>
        ⚠️ Mock data in use – API endpoint unavailable · Refresh every 5 min · Made by EmilIA
      </p>
    </footer>

  <script>
    // Auto-refresh every 5 minutes
    setTimeout(() => location.reload(), 5 * 60 * 1000);
  </script>
</body>
</html>`;
}

// Standalone generation
if (require.main === module) {
  const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  const html = generateHTML(data);
  fs.writeFileSync('index.html', html);
  console.log('✅ index.html generated');
}

module.exports = { generateHTML, formatNumber, formatPercent, formatTimeAgo, getSpreadColor };