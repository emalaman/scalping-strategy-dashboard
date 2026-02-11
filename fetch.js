const fs = require('fs');

// Polymarket API endpoint (REST, not GraphQL)
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

    console.log(`Fetching from ${API_URL}`);
    const response = await fetch(API_URL, {
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

    console.log(`✅ Fetched ${markets.length} markets`);
    
    // Filter only active (non-closed) markets
    const activeMarkets = markets.filter(m => m.active === true || m.closed === false);
    console.log(`📊 Active markets: ${activeMarkets.length}`);
    
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
      liquidity: { YES: 1200000, NO: 1300000 },
    },
    {
      id: 'mock-2',
      question: 'Will ETH ETF be approved in 2025?',
      outcomePrices: [0.47, 0.53],
      updatedAt: new Date(now - 10 * 60000).toISOString(),
      volume: 1800000,
      liquidity: { YES: 846000, NO: 954000 },
    },
    {
      id: 'mock-3',
      question: 'Will Trump win 2024 election?',
      outcomePrices: [0.51, 0.49],
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      volume: 5000000,
      liquidity: { YES: 2550000, NO: 2450000 },
    },
    {
      id: 'mock-4',
      question: 'Will Fed cut rates in June?',
      outcomePrices: [0.49, 0.51],
      updatedAt: new Date(now - 15 * 60000).toISOString(),
      volume: 1200000,
      liquidity: { YES: 588000, NO: 612000 },
    },
    {
      id: 'mock-5',
      question: 'Will Recession hit US in 2025?',
      outcomePrices: [0.52, 0.48],
      updatedAt: new Date(now - 8 * 60000).toISOString(),
      volume: 800000,
      liquidity: { YES: 416000, NO: 384000 },
    },
  ];
}

function analyzeScalpingOpportunity(market) {
  // Polymarket REST returns different field names
  const prices = market.outcomePrices || market.outcomes?.map(o => o.price) || [0, 0];
  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  
  const yesSpread = Math.abs(yes - 0.5);
  const noSpread = Math.abs(no - 0.5);
  const maxSpread = Math.max(yesSpread, noSpread);
  
  const underpricedSide = yes < 0.5 ? 'YES' : no < 0.5 ? 'NO' : 'BALANCED';
  
  const updated = new Date(market.updatedAt || market.lastUpdate || Date.now());
  const hoursSinceUpdate = (Date.now() - updated) / 3600000;
  
  return {
    id: market.id,
    question: market.question,
    yes,
    no,
    sum: yes + no,
    yesSpread,
    noSpread,
    maxSpread,
    underpricedSide,
    underpricedPrice: yes < 0.5 ? yes : no,
    volume: parseFloat(market.volume) || parseFloat(market.volumeNum) || 0,
    liquidity: market.liquidity || (market.liquidityNum ? { YES: market.liquidityNum, NO: market.liquidityNum } : { YES: 0, NO: 0 }),
    updatedAt: market.updatedAt || market.lastUpdate,
    hoursSinceUpdate,
  };
}

function filterScalpingOpportunities(markets, minSpread = 0.015, maxSpread = 0.03, minVolume = 100000) {
  const analyzed = markets.map(analyzeScalpingOpportunity);
  
  const opportunities = analyzed
    .filter(m => m.maxSpread >= minSpread && m.maxSpread <= maxSpread && m.volume >= minVolume)
    .filter(m => m.underpricedSide !== 'BALANCED')
    .sort((a, b) => b.maxSpread - a.maxSpread);
  
  return opportunities.slice(0, 15);
}

async function main() {
  console.log('🚀 Fetching markets for scalping strategy...');
  const markets = await fetchMarkets();
  console.log(`📊 Total markets: ${markets.length}`);
  
  const opportunities = filterScalpingOpportunities(markets);
  console.log(`🎯 Scalping opportunities found: ${opportunities.length}`);
  
  const data = {
    generatedAt: new Date().toISOString(),
    opportunities: opportunities,
    totalCount: opportunities.length,
    filters: {
      minSpread: 0.015,
      maxSpread: 0.03,
      minVolume: 100000,
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