# Scalping Strategy Dashboard

 Real-time scalping opportunities for Polymarket (and other prediction markets).

## Strategy Overview

**Target:** Short-term price imbalances (spreads 1-3%) before market converges to 50/50.

**Ideal events:**
- High volume (>$100k)
- Near expiration (<24h preferred)
- High volatility categories: Politics, Crypto, Live events
- Spread > 1.5% and moving

**Entry:**
- Buy the underpriced side (YES if <50%, NO if >50%)
- Hold 5-30 minutes, take profit at 1-2%
- Stop loss at 1%

**Platforms:** Polymarket (primary), Kalshi, PredictIt

---

## Tech Stack

- **Backend:** Node.js (fetch market data)
- **Frontend:** HTML + Tailwind CSS (live updates)
- **CI/CD:** GitHub Actions (every 30 sec during market hours)
- **Hosting:** GitHub Pages

## Setup

1. Enable GitHub Pages (Settings → Pages → main / root)
2. (Optional) Add `TWITTER_BEARER_TOKEN` for news sentiment integration
3. Access: `https://YOUR_USERNAME.github.io/scalping-strategy-dashboard/`

## Local Dev

```bash
npm install
npm run fetch   # Get market data
npm run generate # Build HTML
npm start       # Serve locally
```

---

Made with ❤️ by EmilIA