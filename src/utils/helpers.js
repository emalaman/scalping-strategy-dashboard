/**
 * Mock data generator for fallback when API fails or key missing
 * Returns data in raw API format (to be processed by analyzeScalpingOpportunity)
 */
export function getMockMarkets() {
  const now = new Date();
  return [
    {
      id: 'mock-1',
      question: 'Will Bitcoin hit $100K before 2026?',
      slug: 'bitcoin-100k-before-2026',
      events: [{ slug: 'crypto-memes' }],
      outcomePrices: [0.48, 0.52],
      volume: 2500000,
      liquidity: 1200000,
      updatedAt: new Date(now - 5 * 60000).toISOString(),
      timeLeft: 14725816016,
    },
    {
      id: 'mock-2',
      question: 'Will ETH ETF be approved in 2025?',
      slug: 'eth-etf-approval-2025',
      events: [{ slug: 'crypto-regulation' }],
      outcomePrices: [0.47, 0.53],
      volume: 1800000,
      liquidity: 846000,
      updatedAt: new Date(now - 10 * 60000).toISOString(),
      timeLeft: 14725816016,
    },
    {
      id: 'mock-3',
      question: 'Will Trump win 2024 election?',
      slug: 'trump-win-2024',
      events: [{ slug: 'us-presidential-election-2024' }],
      outcomePrices: [0.51, 0.49],
      volume: 5000000,
      liquidity: 2550000,
      updatedAt: new Date(now - 2 * 60000).toISOString(),
      timeLeft: 14725816016,
    },
    {
      id: 'mock-4',
      question: 'Will Fed cut rates in June?',
      slug: 'fed-cut-rates-june',
      events: [{ slug: 'fed-meeting' }],
      outcomePrices: [0.49, 0.51],
      volume: 1200000,
      liquidity: 588000,
      updatedAt: new Date(now - 15 * 60000).toISOString(),
      timeLeft: 14725816016,
    },
    {
      id: 'mock-5',
      question: 'Will Recession hit US in 2025?',
      slug: 'recession-us-2025',
      events: [{ slug: 'economic-outlook' }],
      outcomePrices: [0.52, 0.48],
      volume: 800000,
      liquidity: 416000,
      updatedAt: new Date(now - 8 * 60000).toISOString(),
      timeLeft: 14725816016,
    },
  ];
}
