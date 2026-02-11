/**
 * Build script: Fetch markets, analyze, filter, and write to data/opportunities.json
 * Run by `npm run build` before Vite builds the static site.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { inferCategory } from '../src/utils/categories.js';
import { getMockMarkets } from '../src/utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      console.warn('⚠️  POLYMARKET_API_KEY not set. Will use mock data.');
    }

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
      if (!Array.isArray(markets)) {
        markets = markets.markets || markets.data || [];
      }
    } catch (e) {
      console.log('Response is not valid JSON:', text.substring(0, 200));
      throw new Error('Invalid JSON response');
    }

    console.log(`✅ Fetched ${markets.length} markets from API`);
    const activeMarkets = markets.filter(m => m.active === true || m.closed === false);
    console.log(`📊 Active markets after filter: ${activeMarkets.length}`);
    return activeMarkets;
  } catch (error) {
    console.warn(`⚠️  API fetch failed: ${error.message}`);
    return getMockMarkets();
  }
}

function analyzeScalpingOpportunity(market) {
  let prices = market.outcomePrices;
  if (!prices) {
    if (market.bestBid && market.bestAsk) {
      prices = [market.bestBid.toString(), market.bestAsk.toString()];
    } else {
      return null;
    }
  } else if (typeof prices === 'string') {
    try {
      prices = JSON.parse(prices);
    } catch (e) {
      return null;
    }
  }

  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  if (yes === 0 && no === 0) return null;

  const yesSpread = Math.abs(yes - 0.5);
  const noSpread = Math.abs(no - 0.5);
  const maxSpread = Math.max(yesSpread, noSpread);

  const underpricedSide = yes < 0.5 ? 'YES' : no < 0.5 ? 'NO' : 'BALANCED';
  const underpricedPrice = underpricedSide === 'YES' ? yes : no;

  const volume = parseFloat(market.volume) || 0;
  const liquidity = parseFloat(market.liquidity) || 0;

  // Build market URL
  let marketUrl = `https://polymarket.com/market/${market.id}`;
  if (market.events && market.events[0] && market.events[0].slug && market.slug) {
    marketUrl = `https://polymarket.com/event/${market.events[0].slug}/${market.slug}`;
  }

  return {
    id: market.id,
    question: market.question,
    slug: market.slug,
    eventSlug: market.events?.[0]?.slug,
    category: inferCategory(market.question, market.events?.[0]?.slug),
    yes,
    no,
    yesSpread,
    noSpread,
    maxSpread,
    underpricedSide,
    underpricedPrice,
    volume,
    liquidity,
    updatedAt: market.updatedAt,
    timeLeft: market.timeLeft || 0,
    marketUrl,
  };
}

function filterScalpingOpportunities(opportunities, minSpread = 0.015, maxSpread = 0.50, minVolume = 50000) {
  const filtered = opportunities.filter(opp => {
    const spreadOk = opp.maxSpread >= minSpread && opp.maxSpread <= maxSpread;
    const volumeOk = opp.volume >= minVolume;
    const active = opp.timeLeft > 0; // not ended
    return spreadOk && volumeOk && active;
  });

  // Sort by smallest spread first (most balanced)
  filtered.sort((a, b) => a.maxSpread - b.maxSpread);

  return filtered;
}

async function main() {
  console.log('🚀 Starting build data generation...');
  const markets = await fetchMarkets();
  const opportunities = markets
    .map(analyzeScalpingOpportunity)
    .filter(Boolean);

  console.log(`📈 Opportunities before filtering: ${opportunities.length}`);

  const filtered = filterScalpingOpportunities(opportunities);
  console.log(`🎯 Opportunities after spread (1.5%-50%), volume (>$50k), and not ended filter: ${filtered.length}`);

  // Fallback to mock data if API gave no viable opportunities
  const finalOpportunities = filtered.length > 0 ? filtered : (() => {
    console.warn('⚠️  No opportunities passed filters. Using mock fallback data.');
    const mockOpps = getMockMarkets().map(analyzeScalpingOpportunity).filter(Boolean);
    console.log(`🛠️  Added ${mockOpps.length} mock opportunities`);
    return mockOpps;
  })();

  const output = {
    generatedAt: new Date().toISOString(),
    totalCount: finalOpportunities.length,
    filters: {
      minSpread: 0.015,
      maxSpread: 0.50,
      minVolume: 50000,
    },
    opportunities: finalOpportunities,
  };

  // Ensure src/data/ exists
  const srcDataDir = resolve(__dirname, '..', 'src', 'data');
  mkdirSync(srcDataDir, { recursive: true });
  writeFileSync(resolve(srcDataDir, 'opportunities.json'), JSON.stringify(output, null, 2));
  console.log(`✅ Wrote opportunities data to ${srcDataDir}/opportunities.json`);
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
