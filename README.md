# Scalping Strategy Dashboard

Real-time arbitrage opportunities for Polymarket, built as a static HTML dashboard generated from Polymarket market data.

![Dashboard Preview](public/preview.png) <!-- optional -->

## Features

- **Static client-side dashboard**: generated `index.html` with embedded opportunity data
- **Category/signal/time filtering**: filter by Sports, Elections, Crypto, signal, and time to close
- **Pagination**: handles hundreds of opportunities
- **Refresh button / static rebuild flow**: refreshes the current generated page; data updates when the build runs again
- **Small dependency surface**: data fetch uses `node-fetch`; UI is plain HTML/JS with Tailwind CDN

## Tech Stack

- **Node.js scripts** for fetching and generating data
- **Polymarket Gamma API** for market metadata
- **Tailwind CDN** for dashboard styling
- **GitHub Pages** friendly static output

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Fetch Polymarket markets and regenerate data.json/index.html
npm run build

# Optional: serve the directory locally with any static server
python3 -m http.server 3000
# Open http://localhost:3000
```

### Build Data & Generate Site

The build script fetches market data from Polymarket API, filters opportunities, writes `data.json`, and injects the generated opportunities into `index.html`.

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

It should:
1. Install dependencies
2. Run `npm run build` (generates `data.json` + updates `index.html`)
3. Deploy the static files to GitHub Pages

**Important**: The repository must have **Workflow permissions: Read and write** (Settings → Actions → General).

## Project Structure

```
├── fetch.js                     # Fetch & analyze Polymarket markets
├── generate.js                  # Inject generated data into index.html
├── data.json                    # Generated opportunity data
├── index.html                   # Static dashboard
├── package.json
├── README.md
├── README-REACT.md              # React/Vite notes, if that path is restored later
└── src/                         # React/Vite prototype files, not used by current package scripts
```

## Customization

### Change Filter Criteria

Edit `fetch.js`:

```js
const minSpread = 0.015; // 1.5%
const maxSpread = 0.50;  // 50%
const minVolume = 50000; // $50k
```

### Adjust Category Inference

Modify regex patterns in `src/utils/categories.js`.

### Styling

Tailwind config in `tailwind.config.js`. Primary color, fonts, etc.

## 📚 Estratégia de Scalping

Documentação completa da lógica de filtragem, sinais de compra/venda e metodologia:

**[ESTRATEGIA.md](./ESTRATEGIA.md)** - Leitura essencial para entender como as oportunidades são identificadas

### Tópicos covers:
- Critérios de filtragem (tempo, volume, spread)
- Cálculo de sinais (BUY/SELL/STRONG)
- Exemplos práticos
- Arquitetura técnica
- Riscos e limitações

---

## Credits

- Data from [Polymarket Gamma API](https://gamma-api.polymarket.com/)
- Built by Emil_IA

## License

MIT
