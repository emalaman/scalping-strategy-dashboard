// Quick test to debug analysis
const market = {
  id: '517310',
  question: 'Will Trump deport less than 250,000?',
  outcomePrices: ["0.039", "0.961"],
  volume: "1082414.901826",
  liquidityNum: 14875.24043,
  updatedAt: '2026-02-11T00:16:57.618647Z'
};

function analyzeScalpingOpportunity(market) {
  let prices = market.outcomePrices;
  if (!prices || prices.length < 2) {
    if (market.bestBid && market.bestAsk) {
      prices = [market.bestBid.toString(), market.bestAsk.toString()];
    } else {
      prices = ['0', '0'];
    }
  }
  
  const yes = parseFloat(prices[0]) || 0;
  const no = parseFloat(prices[1]) || 0;
  
  console.log(`Processing: ${market.question.substring(0, 40)}...`);
  console.log(`  Prices: YES=${yes}, NO=${no}`);
  
  if (yes === 0 && no === 0) {
    console.log('  → SKIP: both prices zero');
    return null;
  }
  
  const yesSpread = Math.abs(yes - 0.5);
  const noSpread = Math.abs(no - 0.5);
  const maxSpread = Math.max(yesSpread, noSpread);
  
  console.log(`  Spreads: yes=${yesSpread.toFixed(3)}, no=${noSpread.toFixed(3)}, max=${maxSpread.toFixed(3)}`);
  
  const underpricedSide = yes < 0.5 ? 'YES' : no < 0.5 ? 'NO' : 'BALANCED';
  console.log(`  Underpriced side: ${underpricedSide}`);
  
  return {
    id: market.id,
    question: market.question,
    yes, no,
    maxSpread,
    underpricedSide,
    volume: parseFloat(market.volume) || 0,
  };
}

const result = analyzeScalpingOpportunity(market);
console.log('Result:', result);