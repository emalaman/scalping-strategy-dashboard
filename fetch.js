const fs = require('fs');

// Polymarket API endpoint (GET /markets with filters)
const API_URL = 'https://gamma-api.polymarket.com/markets';

async function fetchMarkets() {
  try {
    const apiKey = process.env.POLYMARKET_API_KEY;
    
    const headers = {
      'Accept': 'application/json',
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
      console.log('✅ Using authenticated API (X-API-Key)');
    } else {
      console.warn('⚠️  POLYMARKET_API_KEY not set. Using mock data.');
    }

    // Add query parameters to get only active, non-closed markets, with higher limit
    const url = `${API_URL}?active=true&closed=false&limit=500`;
    console.log(`Fetching from ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });

    const text = await response.text();
    if (!response.ok) {
      console.log(`HTTP ${response.status}: ${text.substring(0, 200)}...`);
      throw new Error(`HTTP ${response.status}`);
    }

    let markets;
    try {
      markets = JSON.parse(text);
      // Ensure it's an array
      if (!Array.isArray(markets)) {
        markets = markets.markets || markets.data || [];
      }
    } catch (e) {
      console.log('Response is not valid JSON:', text.substring(0, 200));
      throw new Error('Invalid JSON response');
    }

    console.log(`✅ Fetched ${markets.length} markets from API`);
    
    // Additional filter for active markets (some may still slip through)
    const activeMarkets = markets.filter(m => m.active === true || m.closed === false);
    console.log(`📊 Active markets after filter: ${activeMarkets.length}`);
    
    return activeMarkets;
  } catch (error) {
    console.warn(`⚠️  API fetch failed: ${error.message}`);
    return getMockMarkets();
  }
}

function getMockMarkets() {
  console.log('🛠️ Generating mock markets for scalping...');
  const now = new Date();
  return [
    {
      id: 'mock-1',
      question: 'Will Bitcoin hit $100K before 2026?',
      outcomePrices: [0.48, 0.52],
      updatedAt: new Date(now - 5 * 60000).toISOString(),
      volume: 2500000,
      liquidity: 1200000,
    },
    {
      id: 'mock-2',
      question: 'Will ETH ETF be approved in 2025?',
      outcomePrices: [0.47, 0.53],
      updatedAt: new Date(now - 10 * 60000).toISOString(),
      volume: 1800000,
      liquidity: 846000,
    },
    {
      id: 'mock-3',
      question: 'Will Trump win 2024 election?',
      outcomePrices: [0.51, 0.49],
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      volume: 5000000,
      liquidity: 2550000,
    },
    {
      id: 'mock-4',
      question: 'Will Fed cut rates in June?',
      outcomePrices: [0.49, 0.51],
      updatedAt: new Date(now - 15 * 60000).toISOString(),
      volume: 1200000,
      liquidity: 588000,
    },
    {
      id: 'mock-5',
      question: 'Will Recession hit US in 2025?',
      outcomePrices: [0.52, 0.48],
      updatedAt: new Date(now - 8 * 60000).toISOString(),
      volume: 800000,
      liquidity: 416000,
    },
  ];
}

function inferCategory(question, eventSlug) {
  const text = (question + ' ' + (eventSlug || '')).toLowerCase();
  
  // Politics / Elections
  if (/\b(election|elect|vote|voter|trump|biden|senate|congress|governor|presidential|primary|ballot|poll)\b/.test(text)) return 'Elections';
  if (/\b(politics|political|government|policy|legislation|senator|congressman|partisan)\b/.test(text)) return 'Politics';
  
  // Sports
  if (/\b(sport|game|match|team|player|win|lose|score|tournament|championship|league|nfl|nba|mlb|soccer|football|tennis|golf|olympic|world cup)\b/.test(text)) return 'Sports';
  
  // Crypto
  if (/\b(crypto|bitcoin|ethereum|blockchain|coin|token|defi|nft|web3|btc|eth|solana|cardano|polkadot)\b/.test(text)) return 'Crypto';
  
  // Finance
  if (/\b(stock|market|bond|interest|rate|inflation|fed|federal reserve|bank|investment|trading|dividend|ipo|merger|acquisition)\b/.test(text)) return 'Finance';
  
  // Geopolitics
  if (/\b(war|conflict|military|army|nation|country|alliance|treaty|invasion|sanction|un|nato|russia|ukraine|israel|iran|china|taiwan)\b/.test(text)) return 'Geopolitics';
  
  // Earnings
  if (/\b(earnings|revenue|profit|loss|quarterly|annual|fiscal|guidance|earnings call|eps|net income)\b/.test(text)) return 'Earnings';
  
  // Tech
  if (/\b(tech|technology|software|hardware|startup|ai|artificial intelligence|app|application|platform|internet|cloud|data|computing|processor|chip|semiconductor)\b/.test(text)) return 'Tech';
  
  // Culture
  if (/\b(movie|film|music|award|oscar|grammy|artist|celebrity|tv|television|streaming|netflix|disney|hollywood|entertainment)\b/.test(text)) return 'Culture';
  
  // World
  if (/\b(world|global|international|worldwide|country|nation|flag|embassy|diplomat)\b/.test(text)) return 'World';
  
  // Economy
  if (/\b(economy|economic|gdp|unemployment|jobs|labor|wage|consumer|spending|recession|growth|deflation|stagflation)\b/.test(text)) return 'Economy';
  
  // Climate & Science
  if (/\b(climate|environment|carbon|emission|global warming|temperature|weather|hurricane|earthquake|disaster|pollution|green|sustainability|renewable)\b/.test(text)) return 'Climate & Science';
  if (/\b(science|research|discovery|space|nasa|rocket|physics|biology|chemistry|medicine|vaccine|disease|virus|pandemic)\b/.test(text)) return 'Climate & Science';
  
  // Mentions
  if (/\b(mentions|mentioned)\b/.test(text)) return 'Mentions';
  
  return 'Other';
}

function analyzeScalpingOpportunity(market) {
  let prices = market.outcomePrices;
  if (!prices) {
    if (market.bestBid && market.bestAsk) {
      prices = [market.bestBid.toString(), market.bestAsk.toString()];
    } else {
      prices = ['0', '0'];
    }
  } else if (typeof prices === 'string') {
    try {
      prices = JSON.parse(prices);
    } catch (e) {
      console.log(`Failed to parse outcomePrices: ${prices}`);
      prices = ['0', '0'];
    }
  }
  
  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  
  if (yes === 0 && no === 0) return null;
  
  const yesSpread = Math.abs(yes - 0.5);
  const noSpread = Math.abs(no - 0.5);
  const maxSpread = Math.max(yesSpread, noSpread);
  
  const underpricedSide = yes < 0.5 ? 'YES' : no < 0.5 ? 'NO' : 'BALANCED';
  
  const updated = new Date(market.updatedAt || market.lastUpdate || Date.now());
  const hoursSinceUpdate = (Date.now() - updated) / 3600000;
  
  // Build Polymarket URL using event slug + market slug
  let marketUrl = `https://polymarket.com/market/${market.id}`;
  if (market.slug) {
    // Try to get event slug from events array
    const eventSlug = market.events?.[0]?.slug || market.eventSlug;
    if (eventSlug) {
      marketUrl = `https://polymarket.com/event/${eventSlug}/${market.slug}`;
    } else {
      marketUrl = `https://polymarket.com/market/${market.slug}`;
    }
  }
  
  // Calculate time remaining until endDate
  const endDate = market.endDate ? new Date(market.endDate) : null;
  const timeLeft = endDate ? endDate.getTime() - Date.now() : null;
  
  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    eventSlug: market.events?.[0]?.slug,
    category: inferCategory(market.question, market.events?.[0]?.slug || market.eventSlug),
    yes,
    no,
    sum: yes + no,
    yesSpread,
    noSpread,
    maxSpread,
    underpricedSide,
    underpricedPrice: yes < 0.5 ? yes : no,
    volume: parseFloat(market.volume) || parseFloat(market.volumeNum) || 0,
    liquidity: parseFloat(market.liquidity) || parseFloat(market.liquidityNum) || 0,
    updatedAt: market.updatedAt || market.lastUpdate,
    hoursSinceUpdate,
    timeLeft,
    marketUrl,
  };
}

function filterScalpingOpportunities(markets) {
  const analyzed = markets.map(analyzeScalpingOpportunity).filter(m => m !== null);
  
  console.log(`📈 Analyzed ${analyzed.length} markets with valid prices`);
  
  // Show top 10 by volume for reference
  analyzed.sort((a,b) => b.volume - a.volume).slice(0, 10).forEach(m => {
    console.log(`   [VOL] ${m.question.substring(0, 40)}... → ${m.underpricedSide} ${(m.yes*100).toFixed(1)}%/${(m.no*100).toFixed(1)}% (vol: ${(m.volume/1000).toFixed(0)}k)`);
  });
  
  // STRATEGY: Find markets where one side is underpriced relative to 50%
  // Target: maxSpread between 1.5% and 50% (inclusive) – capture all imbalances
  // Also require volume > $50k for liquidity
  const opportunities = analyzed
    .filter(m => m.maxSpread >= 0.015 && m.maxSpread <= 0.50 && m.volume >= 50000 && m.timeLeft > 0)
    .filter(m => m.underpricedSide !== 'BALANCED')
    .sort((a, b) => a.maxSpread - b.maxSpread); // SMALLEST spread first (most balanced)
  
  console.log(`🎯 Opportunities after spread (1.5%-50%), volume (>$50k), and not ended filter: ${opportunities.length}`);
  
  // Show what we found (top 10)
  opportunities.slice(0, 10).forEach(m => {
    console.log(`   ✅ ${m.question.substring(0, 40)}... → ${m.underpricedSide} ${(m.yes*100).toFixed(1)}%/${(m.no*100).toFixed(1)}% (spread: ${(m.maxSpread*100).toFixed(1)}%)`);
  });
  
  return opportunities; // Return all (paginated in UI)
}

async function main() {
  console.log('🚀 Fetching markets for scalping strategy...');
  const markets = await fetchMarkets();
  console.log(`📊 Total markets: ${markets.length}`);
  
  // Show some sample data for debugging
  if (markets.length > 0) {
    console.log(`🔍 Sample market: ${markets[0].question.substring(0, 60)}...`);
    console.log(`   Prices: ${markets[0].outcomePrices}`);
    console.log(`   Active: ${markets[0].active}, Closed: ${markets[0].closed}`);
  }
  
  const opportunities = filterScalpingOpportunities(markets);
  console.log(`🎯 Scalping opportunities found: ${opportunities.length}`);
  
  const data = {
    generatedAt: new Date().toISOString(),
    opportunities: opportunities,
    totalCount: opportunities.length,
    filters: {
      minSpread: 0.015,
      maxSpread: 0.50,
      minVolume: 50000,
    },
  };
  
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log('💾 Data saved to data.json');
  
  return opportunities;
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fetchMarkets, analyzeScalpingOpportunity, filterScalpingOpportunities, getMockMarkets };