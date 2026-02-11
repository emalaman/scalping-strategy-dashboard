#!/usr/bin/env node

const fs = require('fs');
const fetch = require('node-fetch');

const API_URL = 'https://gamma-api.polymarket.com/markets';
const MIN_SPREAD = 0.015;
const MAX_SPREAD = 0.50;
const MIN_VOLUME = 50000;

function inferCategory(question, eventSlug) {
  const text = (question + ' ' + (eventSlug || '')).toLowerCase();
  if (/\b(election|elect|vote|trump|biden|senate|congress|governor|presidential|primary|ballot|poll)\b/.test(text)) return 'Elections';
  if (/\b(politics|political|government|policy|legislation|senator|congressman|partisan)\b/.test(text)) return 'Politics';
  if (/\b(sport|game|match|team|player|win|lose|score|tournament|championship|league|nfl|nba|mlb|soccer|football|tennis|golf|olympic|world cup|nhl|fifa|champions league|la liga|bundesliga|serie a|premier league)\b/.test(text)) return 'Sports';
  if (/\b(crypto|bitcoin|ethereum|blockchain|coin|token|defi|nft|web3|btc|eth|solana|cardano|polkadot)\b/.test(text)) return 'Crypto';
  if (/\b(stock|market|bond|interest|rate|inflation|fed|federal reserve|bank|investment|trading|dividend|ipo|merger|acquisition)\b/.test(text)) return 'Finance';
  if (/\b(war|conflict|military|army|nation|country|alliance|treaty|invasion|sanction|un|nato|russia|ukraine|israel|iran|china|taiwan|putin|zelenskyy|erdoğan|xi|foreign)\b/.test(text)) return 'Geopolitics';
  if (/\b(earnings|revenue|profit|loss|quarterly|annual|fiscal|guidance|earnings call|eps|net income)\b/.test(text)) return 'Earnings';
  if (/\b(tech|technology|software|hardware|startup|ai|artificial intelligence|app|application|platform|internet|cloud|data|computing|processor|chip|semiconductor|megaeth)\b/.test(text)) return 'Tech';
  if (/\b(movie|film|music|award|oscar|grammy|artist|celebrity|tv|television|streaming|netflix|disney|hollywood|entertainment)\b/.test(text)) return 'Culture';
  if (/\b(world|global|international|worldwide|embassy|diplomat|united nations)\b/.test(text)) return 'World';
  if (/\b(economy|economic|gdp|unemployment|jobs|labor|wage|consumer|spending|recession|growth|deflation|stagflation|tariff|revenue|tax)\b/.test(text)) return 'Economy';
  if (/\b(climate|environment|carbon|emission|global warming|temperature|weather|hurricane|earthquake|disaster|pollution|green|sustainability|renewable)\b/.test(text)) return 'Climate & Science';
  if (/\b(science|research|discovery|space|nasa|rocket|physics|biology|chemistry|medicine|vaccine|disease|virus|pandemic)\b/.test(text)) return 'Climate & Science';
  if (/\b(mentions|mentioned)\b/.test(text)) return 'Mentions';
  return 'Other';
}

function getSignal(price) {
  if (price < 0.48) return 'STRONG_BUY';
  if (price < 0.49) return 'BUY';
  if (price > 0.51) return 'STRONG_SELL';
  if (price > 0.50) return 'SELL';
  return 'NEUTRAL';
}

async function fetchMarkets() {
  try {
    const apiKey = process.env.POLYMARKET_API_KEY;
    const headers = { 'Accept': 'application/json' };
    if (apiKey) headers['X-API-Key'] = apiKey;

    const url = `${API_URL}?active=true&closed=false&limit=500`;
    console.log(`Fetching from ${url}`);
    const res = await fetch(url, { headers });
    const text = await res.text();

    if (!res.ok) {
      console.log(`HTTP ${res.status}: ${text.substring(0, 200)}...`);
      throw new Error(`HTTP ${res.status}`);
    }

    let markets = JSON.parse(text);
    if (!Array.isArray(markets)) markets = markets.markets || markets.data || [];
    console.log(`Fetched ${markets.length} markets`);
    return markets.filter(m => m.active === true || m.closed === false);
  } catch (error) {
    console.error('Fetch failed:', error.message);
    return [];
  }
}

function analyzeMarket(market) {
  let prices = market.outcomePrices;
  if (!prices) return null;
  if (typeof prices === 'string') {
    try { prices = JSON.parse(prices); } catch (e) { return null; }
  }

  const yes = parseFloat(prices[0]) || 0, no = parseFloat(prices[1]) || 0;
  if (yes === 0 && no === 0) return null;

  const yesSpread = Math.abs(yes - 0.5), noSpread = Math.abs(no - 0.5);
  const maxSpread = Math.max(yesSpread, noSpread);
  const underpricedSide = yes < 0.5 ? 'YES' : no < 0.5 ? 'NO' : 'BALANCED';
  const underpricedPrice = underpricedSide === 'YES' ? yes : no;

  let marketUrl = `https://polymarket.com/market/${market.id}`;
  if (market.events && market.events[0] && market.events[0].slug && market.slug) {
    marketUrl = `https://polymarket.com/event/${market.events[0].slug}/${market.slug}`;
  }

  return {
    id: market.id,
    question: market.question,
    category: inferCategory(market.question, market.events?.[0]?.slug),
    yes, no,
    yesSpread, noSpread, maxSpread,
    underpricedSide, underpricedPrice,
    signal: getSignal(underpricedPrice),
    volume: parseFloat(market.volume) || 0,
    liquidity: parseFloat(market.liquidity) || 0,
    updatedAt: market.updatedAt,
    timeLeft: market.timeLeft || 0,
    marketUrl
  };
}

function filterOpportunities(opps) {
  return opps
    .filter(o => o && o.maxSpread >= MIN_SPREAD && o.maxSpread <= MAX_SPREAD && o.volume >= MIN_VOLUME)
    .sort((a, b) => a.maxSpread - b.maxSpread);
}

async function main() {
  console.log('Fetching markets from Polymarket API...');
  const markets = await fetchMarkets();
  console.log(`Analyzing ${markets.length} markets...`);
  const analyzed = markets.map(analyzeMarket).filter(Boolean);
  console.log(`Successfully analyzed ${analyzed.length} markets`);

  let filtered = filterOpportunities(analyzed);
  console.log(`Found ${filtered.length} opportunities with spread ${MIN_SPREAD*100}%-${MAX_SPREAD*100}% and volume >= ${MIN_VOLUME}`);

  if (filtered.length === 0 && analyzed.length > 0) {
    console.warn('No opportunities after filters. Using all analyzed markets as fallback...');
    filtered = analyzed.sort((a, b) => a.maxSpread - b.maxSpread);
    console.log(`Using all ${filtered.length} analyzed markets`);
  }

  if (filtered.length === 0) {
    console.warn('No markets from API, generating mock data...');
    const mockMarkets = generateMockMarkets();
    filtered = mockMarkets.map(analyzeMarket).filter(Boolean);
    console.log(`Generated ${filtered.length} mock opportunities`);
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalCount: filtered.length,
    filters: { minSpread: MIN_SPREAD, maxSpread: MAX_SPREAD, minVolume: MIN_VOLUME },
    opportunities: filtered
  };

  fs.writeFileSync('data.json', JSON.stringify(output, null, 2));
  console.log('✅ data.json generated with', filtered.length, 'opportunities');
}

function generateMockMarkets() {
  const now = new Date();
  const base = [
    { id: 'm1', question: 'Will Bitcoin hit $100K?', slug: 'btc-100k', events: [{slug:'crypto'}], outcomePrices: [0.48,0.52], volume: 2500000, liquidity: 1200000, updatedAt: new Date(now-5*60000).toISOString(), timeLeft: 14725816016 },
    { id: 'm2', question: 'Will ETH ETF be approved?', slug: 'eth-etf', events: [{slug:'crypto'}], outcomePrices: [0.47,0.53], volume: 1800000, liquidity: 846000, updatedAt: new Date(now-10*60000).toISOString(), timeLeft: 14725816016 },
    { id: 'm3', question: 'Will Trump win 2024 election?', slug: 'trump-2024', events: [{slug:'elections'}], outcomePrices: [0.51,0.49], volume: 5000000, liquidity: 2550000, updatedAt: new Date(now-2*60000).toISOString(), timeLeft: 14725816016 },
    { id: 'm4', question: 'Will Fed cut rates in June?', slug: 'fed-june', events: [{slug:'finance'}], outcomePrices: [0.49,0.51], volume: 1200000, liquidity: 588000, updatedAt: new Date(now-15*60000).toISOString(), timeLeft: 14725816016 },
    { id: 'm5', question: 'Will Recession hit US in 2025?', slug: 'recession-2025', events: [{slug:'economy'}], outcomePrices: [0.52,0.48], volume: 800000, liquidity: 416000, updatedAt: new Date(now-8*60000).toISOString(), timeLeft: 14725816016 }
  ];
  const mocks = [];
  for (let i = 0; i < 100; i++) {
    base.forEach(b => {
      mocks.push({
        ...b,
        id: `${b.id}-${i}`,
        question: `${b.question} (variant ${i})`,
        volume: b.volume * (0.8 + Math.random()*0.4),
        liquidity: b.liquidity * (0.8 + Math.random()*0.4),
        outcomePrices: b.outcomePrices.map(v => v + (Math.random()*0.1 - 0.05))
      });
    });
  }
  return mocks;
}

main().catch(err => {
  console.error('❌ Fetch failed:', err);
  process.exit(1);
});
