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
  if (spread >= 0.025) return 'text-green-400';
  if (spread >= 0.02) return 'text-yellow-500';
  return 'text-orange-400';
}

function getSideColor(side) {
  return side === 'YES' ? 'text-blue-400' : 'text-pink-400';
}

function getSignal(side, price) {
  if (price < 0.48) return { text: 'STRONG BUY', color: 'bg-green-900/30 text-green-400 border-green-600' };
  if (price < 0.49) return { text: 'BUY', color: 'bg-blue-900/30 text-blue-400 border-blue-600' };
  if (price > 0.51) return { text: 'STRONG SELL', color: 'bg-red-900/30 text-red-400 border-red-600' };
  if (price > 0.5) return { text: 'SELL', color: 'bg-orange-900/30 text-orange-400 border-orange-600' };
  return { text: 'NEUTRAL', color: 'bg-gray-800 text-gray-400 border-gray-600' };
}

function formatTimeLeft(ms) {
  if (!ms || ms <= 0) return 'Ended';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function generateHTML(data) {
  const { generatedAt, opportunities, totalCount, filters } = data;
  const lastUpdate = new Date(generatedAt).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Pagination state (client-side)
  const PAGE_SIZE = 50;

  // Group opportunities by category for filter counts
  const groupedByCategory = {};
  opportunities.forEach(opp => {
    const cat = opp.category || 'Other';
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(opp);
  });

  // Sort categories alphabetically
  const categories = Object.keys(groupedByCategory).sort();

  // Generate category filter dropdown
  const categoryFilter = `
    <div class="flex justify-center mb-8 flex-wrap gap-4 items-center">
      <label for="categoryFilter" class="text-gray-300 font-medium">Filter by Category:</label>
      <select id="categoryFilter" onchange="applyFilters()" class="px-4 py-2 bg-dark-800 border border-gray-700 rounded text-white font-medium focus:outline-none focus:border-primary-500">
        <option value="All">All Categories (${totalCount})</option>
        ${categories.map(cat => `<option value="${cat}">${cat} (${groupedByCategory[cat].length})</option>`).join('')}
      </select>
    </div>
  `;

  // Helper to generate a card HTML
  const generateCard = (opp) => {
    const signal = getSignal(opp.underpricedSide === 'YES' ? opp.yes : opp.underpricedPrice, opp.underpricedPrice);
    const spreadColor = getSpreadColor(opp.maxSpread);
    const targetProfit = (opp.maxSpread * 100).toFixed(1);
    const catId = (opp.category || 'Other').replace(/\s+/g, '-');
    return `
      <article class="bg-dark-800 rounded-lg p-5 border border-gray-700 card-hover" data-category="${catId}">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="badge ${signal.color}">${signal.text}</span>
            <span class="badge bg-gray-800 text-gray-300 border-gray-600">${opp.underpricedSide}</span>
          </div>
          <span class="text-xs text-gray-500">${formatTimeAgo(opp.updatedAt)}</span>
        </div>
        
        <h3 class="text-lg font-bold text-white mb-4 leading-tight line-clamp-2">${opp.question}</h3>
        
        <!-- Prices -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-dark-900 p-3 rounded border ${opp.yes < 0.5 ? 'border-blue-600' : 'border-gray-700'}">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-400 text-sm">YES</span>
              <span class="font-mono ${getSideColor('YES')} font-bold">${formatPercent(opp.yes)}</span>
            </div>
            <div class="text-xs text-gray-500">Spread: ${formatPercent(opp.yesSpread)}</div>
          </div>
          <div class="bg-dark-900 p-3 rounded border ${opp.no < 0.5 ? 'border-pink-600' : 'border-gray-700'}">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-400 text-sm">NO</span>
              <span class="font-mono ${getSideColor('NO')} font-bold">${formatPercent(opp.no)}</span>
            </div>
            <div class="text-xs text-gray-500">Spread: ${formatPercent(opp.noSpread)}</div>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 text-xs mb-4">
          <div class="bg-dark-900 p-2 rounded text-center border border-gray-700">
            <div class="text-gray-500">Spread</div>
            <div class="font-bold ${spreadColor}">${(opp.maxSpread*100).toFixed(1)}%</div>
          </div>
          <div class="bg-dark-900 p-2 rounded text-center border border-gray-700">
            <div class="text-gray-400">Volume</div>
            <div class="font-bold text-white">${formatNumber(opp.volume)}</div>
          </div>
          <div class="bg-dark-900 p-2 rounded text-center border border-gray-700">
            <div class="text-gray-400">Liquidity</div>
            <div class="font-bold text-green-400">${formatNumber(opp.liquidity)}</div>
          </div>
        </div>
        
        <!-- Time Remaining -->
        ${opp.timeLeft ? `
        <div class="mb-4 text-center border-b border-gray-700 pb-3">
          <span class="text-xs text-gray-400">⏱️ Ends in: <span class="font-mono text-primary-400">${formatTimeLeft(opp.timeLeft)}</span></span>
        </div>
        ` : ''}
        
        <!-- Action Button -->
        <div class="pt-3">
          <button onclick="window.open('${opp.marketUrl}', '_blank')" class="w-full py-2 bg-primary-900/30 border border-primary-600 rounded hover:bg-primary-800/40 transition text-white font-semibold text-sm">
            🎯 ${opp.underpricedSide} at ${formatPercent(opp.underpricedPrice)} → Target +${targetProfit}%
          </button>
        </div>
      </article>
    `;
  };

  // Create flat array of all cards (already sorted by spread)
  const allCards = opportunities.map(generateCard);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scalping Strategy Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#e3f2fd',
              100: '#bbdefb',
              200: '#90caf9',
              300: '#64b5f6',
              400: '#42a5f5',
              500: '#2196f3',
              600: '#1e88e5',
              700: '#1976d2',
              800: '#1565c0',
              900: '#0d47a1',
            },
            dark: {
              900: '#0a0a0a',
              800: '#121212',
              700: '#1a1a1a',
              600: '#242424',
              500: '#2e2e2e',
            }
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #0a0a0a;
      color: #e5e5e5;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .solid-border {
      border: 1px solid #333;
    }
    .border-primary {
      border-color: #1565c0;
    }
    .card-hover {
      transition: all 0.2s ease;
    }
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      border-width: 1px;
      border-style: solid;
    }
    .pagination-btn {
      @apply px-3 py-1 border border-gray-600 bg-dark-800 text-white rounded hover:bg-dark-700 transition;
    }
    .pagination-btn.active {
      @apply bg-primary-800 border-primary-500 text-white;
    }
    .pagination-btn:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
  </style>
</head>
<body class="min-h-screen bg-dark-900">
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    <!-- Header -->
    <header class="mb-10 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-2 text-white border-b-2 border-primary-600 pb-2 inline-block">
        Scalping Strategy Dashboard
      </h1>
      <p class="text-gray-400 text-lg">
        Top <span class="text-white font-semibold">${totalCount}</span> opportunities · Spread <span class="text-white font-semibold">1.5%-50%</span> · Vol > <span class="text-white font-semibold">${formatNumber(filters.minVolume)}</span>
        <br>
        Last updated: <span class="text-primary-400 font-mono">${lastUpdate}</span>
      </p>
      <div class="mt-4 flex justify-center gap-4 flex-wrap">
        <button onclick="location.reload()" class="px-4 py-2 bg-primary-900/50 border border-primary-600 rounded hover:bg-primary-800/50 transition text-primary-200 font-medium">
          🔄 Refresh now
        </button>
      </div>
    </header>

    <!-- Category Filter -->
    ${categoryFilter}

    <!-- Pagination Controls (top) -->
    <div id="pagination-top" class="flex justify-center items-center gap-2 mb-8"></div>

    <!-- Opportunities Grid (flat, paginated) -->
    ${totalCount === 0 ? `
    <div class="text-center py-20">
      <div class="text-6xl mb-4">📊</div>
      <h3 class="text-xl font-bold text-gray-300 mb-2">No scalping opportunities right now</h3>
      <p class="text-gray-500">Spreads are too tight or markets are balanced. Check back later when volatility increases.</p>
    </div>
    ` : `
    <div id="opportunities-grid" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Cards injected by JS -->
    </div>
    `}
    
    <!-- Pagination Controls (bottom) -->
    <div id="pagination-bottom" class="flex justify-center items-center gap-2 mt-8"></div>
    
    <!-- Footer -->
    <footer class="text-center py-8 text-gray-500 text-sm mt-12 border-t border-gray-800">
      <p class="mb-2">
        Data from Polymarket Gamma API · Filter: Spread ${(filters.minSpread*100).toFixed(1)}%-${(filters.maxSpread*100).toFixed(1)}% · Vol > ${formatNumber(filters.minVolume)}
      </p>
      <p>
        Made by Emil_IA · Auto-refresh every 5 minutes
      </p>
    </footer>

  <script>
    const allCards = ${JSON.stringify(allCards)};
    const PAGE_SIZE = ${PAGE_SIZE};
    const totalCount = ${totalCount};
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    let currentPage = 1;
    let currentCategory = 'All';

    function getFilteredCards() {
      if (currentCategory === 'All') return allCards;
      return allCards.filter(item => item.category === currentCategory);
    }

    function renderPage(page) {
      const grid = document.getElementById('opportunities-grid');
      const filtered = getFilteredCards();
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageCards = filtered.slice(start, end);
      
      grid.innerHTML = pageCards.join('');
      
      // Update pagination controls
      updatePaginationControls();
    }

    function updatePaginationControls() {
      const top = document.getElementById('pagination-top');
      const bottom = document.getElementById('pagination-bottom');
      const filteredCount = currentCategory === 'All' ? totalCount : parseInt(document.querySelector('#categoryFilter option[value="' + currentCategory + '"]').text.split('(')[1].replace(')', ''));
      const pages = Math.ceil(filteredCount / PAGE_SIZE);
      
      let buttons = '';
      
      // Prev
      buttons += \`<button class="pagination-btn" onclick="changePage(\${currentPage - 1})" \${currentPage === 1 ? 'disabled' : ''}>← Prev</button>\`;
      
      // Page numbers (show around current)
      for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= currentPage - 2 && i <= currentPage + 2)) {
          buttons += \`<button class="pagination-btn \${i === currentPage ? 'active' : ''}" onclick="changePage(\${i})">\${i}</button>\`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
          buttons += \`<span class="text-gray-500">...</span>\`;
        }
      }
      
      // Next
      buttons += \`<button class="pagination-btn" onclick="changePage(\${currentPage + 1})" \${currentPage === pages ? 'disabled' : ''}>Next →</button>\`;
      
      top.innerHTML = buttons;
      bottom.innerHTML = buttons;
    }

    function changePage(page) {
      const filteredCount = currentCategory === 'All' ? totalCount : parseInt(document.querySelector('#categoryFilter option[value="' + currentCategory + '"]').text.split('(')[1].replace(')', ''));
      const pages = Math.ceil(filteredCount / PAGE_SIZE);
      if (page < 1 || page > pages) return;
      currentPage = page;
      renderPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function applyFilters() {
      const catSelect = document.getElementById('categoryFilter');
      currentCategory = catSelect.value;
      currentPage = 1;
      renderPage(1);
    }

    // Initial render
    renderPage(1);

    // Auto-refresh
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

module.exports = { generateHTML, formatNumber, formatPercent, formatTimeAgo, getSpreadColor, getSideColor, getSignal, formatTimeLeft };