const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const newScript = `
    // Data generated at build time
    const opportunities = %OPPORTUNITIES_JSON%;

    const PAGE_SIZE = 50;
    let currentPage = 1, currentCategory = 'All', currentSignal = 'All';

    function formatNumber(n) {
      if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
      if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
      return n?.toLocaleString()||'0';
    }
    function formatPercent(n) { return (n*100).toFixed(2)+'%'; }
    function timeAgo(s) {
      const d = new Date(s), now = new Date();
      const m = Math.floor((now-d)/6e4);
      if (m<1) return 'Just now';
      if (m<60) return m+'m ago';
      const h = Math.floor(m/60);
      if (h<24) return h+'h ago';
      return Math.floor(h/24)+'d ago';
    }
    function timeLeft(ms) {
      if (!ms||ms<=0) return 'Ended';
      const d = Math.floor(ms/864e5), h = Math.floor((ms%864e5)/36e5);
      return d>0? d+'d '+h+'h' : h+'h';
    }
    function getSpreadColor(s) { return s>=.025?'text-green-400':s>=.02?'text-yellow-500':'text-orange-400'; }
    function getSideColor(s) { return s==='YES'?'text-blue-400':'text-pink-400'; }

    function generateCard(o) {
      const spreadColor = getSpreadColor(o.maxSpread);
      const target = (o.maxSpread*100).toFixed(1);
      const signalMap = {
        'STRONG_BUY': { label: 'STRONG BUY', classes: 'bg-green-900/30 text-green-400 border-green-600' },
        'BUY': { label: 'BUY', classes: 'bg-blue-900/30 text-blue-400 border-blue-600' },
        'STRONG_SELL': { label: 'STRONG SELL', classes: 'bg-red-900/30 text-red-400 border-red-600' },
        'SELL': { label: 'SELL', classes: 'bg-orange-900/30 text-orange-400 border-orange-600' },
        'NEUTRAL': { label: 'NEUTRAL', classes: 'bg-gray-800 text-gray-400 border-gray-600' }
      };
      const sig = signalMap[o.signal] || signalMap['NEUTRAL'];
      return \`
      <article class="card card-hover p-5" data-category="\${o.category}">
        <div class="flex justify-between mb-4">
          <div class="flex gap-2">
            <span class="badge \${sig.classes}">\${sig.label}</span>
            <span class="badge bg-gray-800 text-gray-300 border-gray-600">\${o.underpricedSide}</span>
          </div>
          <span class="text-xs text-gray-500">\${timeAgo(o.updatedAt)}</span>
        </div>
        <h3 class="text-lg font-bold text-white mb-4 line-clamp-2">\${o.question}</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="p-3 rounded \${o.yes<.5?'border border-blue-600':'border border-gray-700'} bg-dark-900">
            <div class="flex justify-between mb-1">
              <span class="text-gray-400 text-sm">YES</span>
              <span class="\${getSideColor('YES')} font-bold">\${formatPercent(o.yes)}</span>
            </div>
            <div class="text-xs text-gray-500">Spread: \${formatPercent(o.yesSpread)}</div>
          </div>
          <div class="p-3 rounded \${o.no<.5?'border border-pink-600':'border border-gray-700'} bg-dark-900">
            <div class="flex justify-between mb-1">
              <span class="text-gray-400 text-sm">NO</span>
              <span class="\${getSideColor('NO')} font-bold">\${formatPercent(o.no)}</span>
            </div>
            <div class="text-xs text-gray-500">Spread: \${formatPercent(o.noSpread)}</div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs mb-4">
          <div class="p-2 rounded text-center border border-gray-700 bg-dark-900">
            <div class="text-gray-500">Spread</div>
            <div class="\${spreadColor} font-bold">\${(o.maxSpread*100).toFixed(1)}%</div>
          </div>
          <div class="p-2 rounded text-center border border-gray-700 bg-dark-900">
            <div class="text-gray-400">Vol</div>
            <div class="text-white font-bold">\${formatNumber(o.volume)}</div>
          </div>
          <div class="p-2 rounded text-center border border-gray-700 bg-dark-900">
            <div class="text-gray-400">Liq</div>
            <div class="text-green-400 font-bold">\${formatNumber(o.liquidity)}</div>
          </div>
        </div>
        \${o.timeLeft?\`<div class="mb-4 text-center border-b border-gray-700 pb-2"><span class="text-xs text-gray-400">⏱️ Ends: <span class="font-mono text-primary-400">\${timeLeft(o.timeLeft)}</span></span></div>\`:''}
        <button onclick="window.open('\${o.marketUrl}','_blank')" class="w-full py-2 bg-primary-900/30 border border-primary-600 rounded hover:bg-primary-800/40 text-white font-semibold">
          🎯 \${o.underpricedSide} at \${formatPercent(o.underpricedPrice)} → Target +\${target}%
        </button>
      </article>\`;
    }

    function render() {
      let filtered = opportunities;
      if (currentCategory !== 'All') filtered = filtered.filter(o => o.category === currentCategory);
      if (currentSignal !== 'All') filtered = filtered.filter(o => o.signal === currentSignal);
      const totalPages = Math.ceil(filtered.length/PAGE_SIZE);
      const start = (currentPage-1)*PAGE_SIZE;
      const pageData = filtered.slice(start, start+PAGE_SIZE);

      document.getElementById('grid').innerHTML = pageData.map(generateCard).join('');

      const top = document.getElementById('pagination-top');
      const bot = document.getElementById('pagination-bottom');
      let btns = '';
      btns += \`<button class="pagination-btn" \${currentPage===1?'disabled':''} onclick="changePage(\${currentPage-1})">← Prev</button>\`;
      for(let p=1;p<=totalPages;p++) {
        if(p===1||p===totalPages||(p>=currentPage-2&&p<=currentPage+2)){
          btns += \`<button class="pagination-btn \${p===currentPage?'active':''}" onclick="changePage(\${p})">\${p}</button>\`;
        } else if(p===currentPage-3||p===currentPage+3){
          btns += \`<span class="text-gray-500">...</span>\`;
        }
      }
      btns += \`<button class="pagination-btn" \${currentPage===totalPages?'disabled':''} onclick="changePage(\${currentPage+1})">Next →</button>\`;
      top.innerHTML = btns; bot.innerHTML = btns;
    }

    function changePage(p) {
      let filtered = opportunities;
      if (currentCategory !== 'All') filtered = filtered.filter(o => o.category === currentCategory);
      if (currentSignal !== 'All') filtered = filtered.filter(o => o.signal === currentSignal);
      const totalPages = Math.ceil(filtered.length/PAGE_SIZE);
      if(p<1||p>totalPages) return;
      currentPage = p; render();
    }

    function applyFilters() {
      const sel = document.getElementById('category-filter');
      currentCategory = sel.value;
      const sigSel = document.getElementById('signal-filter');
      currentSignal = sigSel.value;
      currentPage = 1;
      render();
    }

    (function(){
      document.getElementById('total-count').textContent = opportunities.length;
      document.getElementById('last-update').textContent = new Date().toLocaleTimeString();

      const cats = ['All', ...new Set(opportunities.map(o=>o.category))].sort();
      const sel = document.getElementById('category-filter');
      cats.forEach(cat => {
        const count = cat==='All'? opportunities.length : opportunities.filter(o=>o.category===cat).length;
        sel.innerHTML += \`<option value="\${cat}" \${cat===currentCategory?'selected':''}>\${cat} (\${count})</option>\`;
      });

      const signals = ['All', 'STRONG_BUY', 'BUY', 'SELL', 'STRONG_SELL'];
      const sigSel = document.getElementById('signal-filter');
      signals.forEach(sig => {
        const count = sig==='All'? opportunities.length : opportunities.filter(o=>o.signal===sig).length;
        const label = sig==='All'?'All Signals':sig.replace('_',' ');
        sigSel.innerHTML += \`<option value="\${sig}" \${sig===currentSignal?'selected':''}>\${label} (\${count})</option>\`;
      });

      render();
      setTimeout(location.reload, 5*60*1000);
    })();
  </script>
`;
// Find the script tag boundaries
const start = html.indexOf('<script>') + 8;
const end = html.lastIndexOf('</script>');
if (start > 8 && end > start) {
  const newHtml = html.substring(0, start) + '\n' + newScript + '\n' + html.substring(end);
  fs.writeFileSync('index.html', newHtml);
  console.log('Script replaced successfully');
} else {
  console.error('Could not find script tags');
}
