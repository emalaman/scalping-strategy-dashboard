# Scalping Strategy Dashboard

Real-time arbitrage opportunities for Polymarket, built with **React + Vite**.

![Dashboard Preview](public/preview.png) <!-- optional -->

## Features

- **Dynamic client-side rendering**: Fast, responsive grid
- **Category filtering**: Filter by Sports, Elections, Crypto, etc.
- **Pagination**: 50 items per page, handles 400+ opportunities
- **Auto-refresh**: Every 5 minutes
- **Zero external dependencies**: Pure static build, deploy to GitHub Pages

## Tech Stack

- **React 18** + Vite (-fast HMR, optimized builds)
- **Tailwind CSS** (dark theme, professional style)
- **GitHub Actions** (scheduled builds every 5 min)
- **GitHub Pages** (static hosting)

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Data & Generate Site

The build script fetches market data from Polymarket API, filters, and generates `src/data/opportunities.json`. Then Vite builds the static site.

```bash
npm run build
```

Output goes to `dist/`.

## Configuration

### Environment Variables

Create `.env` in project root:

```env
POLYMARKET_API_KEY=your_key_here
```

If not set, the dashboard falls back to mock data.

Get an API key from [Polymarket Gamma API](https://gamma-api.polymarket.com/).

### API & Filters

- **Endpoint**: `https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=500`
- **Filters**: spread 1.5%–50%, volume > $50k, `timeLeft > 0`
- **Sort**: smallest spread first

## Deployment

### GitHub Pages (manual)

1. Push to `main` branch
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch**
4. Branch: `gh-pages` (or `main` → `/dist` folder)
5. Save

Your site will be at: `https://YOUR_USERNAME.github.io/scalping-strategy-dashboard/`

### GitHub Actions (auto)

The workflow `.github/workflows/deploy.yml` runs on schedule (`*/5 * * * *`) and on push to `main`.

It:
1. Installs dependencies
2. Runs `npm run build` (generates data + static site)
3. Deploys `dist/` to GitHub Pages using `peaceiris/actions-gh-pages`

**Important**: The repository must have **Workflow permissions: Read and write** (Settings → Actions → General).

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── CategoryFilter.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── MarketCard.jsx
│   │   └── Pagination.jsx
│   ├── data/                    # Generated at build
│   │   └── opportunities.json
│   ├── hooks/
│   │   └── useOpportunities.js
│   ├── utils/
│   │   ├── categories.js        # inferCategory
│   │   ├── formatters.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── scripts/
│   └── build.js                 # Fetch & filter data
├── public/
│   └── vite.svg
├── .github/workflows/deploy.yml
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

## Customization

### Change Filter Criteria

Edit `scripts/build.js`:

```js
const minSpread = 0.015; // 1.5%
const maxSpread = 0.50;  // 50%
const minVolume = 50000; // $50k
```

### Adjust Category Inference

Modify regex patterns in `src/utils/categories.js`.

### Styling

Tailwind config in `tailwind.config.js`. Primary color, fonts, etc.

## Credits

- Data from [Polymarket Gamma API](https://gamma-api.polymarket.com/)
- Built by Emil_IA

## License

MIT
