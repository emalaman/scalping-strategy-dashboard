# Scalping Strategy Dashboard - React + Vite

Um dashboard de arbitragem para Polymarket, construído com React e Vite, com paginação, filtros por categoria e auto-refresh.

## 🚀 Tecnologias

- **React 18** - UI component library
- **Vite** - Build tool super rápido
- **Tailwind CSS** - Estilização utilitária
- **GitHub Pages** - Deploy estático

## 📦 Estrutura do Projeto

```
src/
├── components/
│   ├── MarketCard.jsx      # Card de oportunidade individual
│   ├── CategoryFilter.jsx  # Dropdown de categorias
│   ├── Pagination.jsx      # Controles de paginação
│   ├── Header.jsx          # Cabeçalho do dashboard
│   └── Footer.jsx          # Rodapé
├── hooks/
│   └── useOpportunities.js # Hook personalizado para gerenciar dados
├── utils/
│   ├── formatters.js       # Funções de formatação (number, percent, time)
│   ├── categories.js       # inferCategory e constants
│   └── helpers.js          # Helpers diversos
├── data/
│   └── opportunities.json  # Dados gerados no build (git-ignored)
├── App.jsx                 # Componente principal
├── main.jsx               # Entry point
└── index.css              # Estilos globais + Tailwind

## 🛠️ Setup e Desenvolvimento

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

### Build e Deploy

O projeto gera arquivos estáticos em `dist/` (configurável no `vite.config.js`), prontos para GitHub Pages.

```bash
npm run build
```

Os arquivos em `dist/` devem ser Commitados para o branch `gh-pages` ou `main` (conforme configuração do GitHub Pages).

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
POLYMARKET_API_KEY=sua_chave_aqui
```

Para deploy no GitHub Actions, configure o segredo `POLYMARKET_API_KEY` no repositório.

### GitHub Pages

No repositório:
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` (ou `gh-pages`), folder: `/dist` (ou `/build`)
4. Save

## 📊 Dados e Atualização

O dashboard:
- Faz fetch da API Polymarket (`/markets?active=true&closed=false&limit=500`)
- Filtra: spread 1.5%-50%, volume > $50k, não terminados
- Categoriza usando regex
- Paginação: 50 por página
- Auto-refresh a cada 5 minutos

Dados são gerados no build e embutidos no bundle. Para atualizar:
- Local: `npm run build` + commit
- GitHub Actions: workflow roda a cada 5 min (cron) e no push

## 📁 Arquivos Importantes

- `src/App.jsx` - Lógica principal, estado, filtros
- `src/utils/categories.js` - Regex de inferência de categorias
- `public/` - Arquivos estáticos (favicon, etc.)
- `vite.config.js` - Configuração do Vite
- `.github/workflows/deploy.yml` - CI/CD

## 🎨 Estilização

Tailwind CSS via CDN (desenvolvimento) e PurgeCSS em produção. Cores:
- Background: `#0a0a0a`
- Primary: `#1565c0`
- Cards: `#121212` com bordas `#333`

## 📝 Licença

MIT
