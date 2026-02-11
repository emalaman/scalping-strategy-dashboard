# 🎯 Estratégia de Scalping - Polymarket

**Documentação Técnica Completa**  
Dashboard: https://emalaman.github.io/scalping-strategy-dashboard/

---

## 📊 Visão Geral

O **Scalping Strategy Dashboard** monitora mercados de predição do Polymarket identificando oportunidades de **scalping** (ganhos rápidos de 1-3%) baseadas em ineficiências de preço entre os contratos **YES** e **NO**.

### Princípio Fundamental

Em mercados de predição binária (YES/NO), a soma dos preços deve ser ~1.0 (100%). Quando um lado está muito desvalorizado (<0.45) ou sobrevalorizado (>0.55), há oportunidade de arbitragem ou scalping.

---

## 🔍 Critérios de Filtragem

### 1. **Filtro de Tempo (Crítico)**
```javascript
timeLeft > 0  // Mercado ainda não expirado
```
- Exclui mercados sem data de término definida
- Exclui mercados já expirados
- Foco apenas em mercados **ativos e com prazo de validade**

### 2. **Filtro de Volume**
```javascript
MIN_VOLUME = 20000  // $20,000 mínimo
```
- Garante liquidez suficiente para entrar/sair posições
- Volume é o total negociado no mercado (em USD)

### 3. **Filtro de Spread**
```javascript
MIN_SPREAD = 0.015  // 1.5%
MAX_SPREAD = 0.50   // 50%
```
- `maxSpread = max(|yes - 0.5|, |no - 0.5|)`
- Exclude mercados muito balanceados (spread < 1.5%) - pouca margem
- Exclude mercados extremamente desbalanceados (>50%) - risco muito alto

### 4. **Filtro de Categoria** (padrão)
- Apenas mercados de **Polymarket** (não restrito a cripto)
- Todas as categorias são incluídas (política, esportes, cripto, etc.)

---

## 📈 Lógica de Sinal

### Cálculo do Preço "Underpriced"

Para cada mercado, identificamos qual lado (YES ou NO) está mais distante de 50%:

```javascript
yesSpread = Math.abs(yesPrice - 0.5)
noSpread = Math.abs(noPrice - 0.5)
maxSpread = Math.max(yesSpread, noSpread)

if (yes < 0.5) {
  underpricedSide = 'YES'
  underpricedPrice = yes
} else if (no < 0.5) {
  underpricedSide = 'NO'
  underpricedPrice = no
} else {
  underpricedSide = 'BALANCED'
}
```

### Geração de Sinal

Baseado no preço **underpriced** (lado com valor < 0.5):

| Preço | Sinal | Interpretação |
|-------|-------|---------------|
| < 0.45 | STRONG_BUY | Alta probabilidade de valorização (probabilidade subestimada) |
| 0.45 - 0.48 | BUY | Boa oportunidade de compra |
| 0.48 - 0.52 | NEUTRAL | Sem sinal claro |
| 0.52 - 0.55 | SELL | Considerar venda/ short |
| > 0.55 | STRONG_SELL | Alta probabilidade de perda (sobrevalorizado) |

**Nota:** A lógica atual (do código fonte) é:

```javascript
function getSignal(price, side) {
  if (side === 'YES') {
    if (price < 0.48) return 'STRONG_BUY';
    if (price < 0.49) return 'BUY';
    return 'NEUTRAL';
  } else if (side === 'NO') {
    if (price < 0.48) return 'STRONG_SELL';
    if (price < 0.49) return 'SELL';
    return 'NEUTRAL';
  }
  return 'NEUTRAL';
}
```

---

## 🎯 Estratégia de Scalping

### Objetivo
- **Ganhos rápidos** (horas a dias, não semanas/meses)
- **Risco controlado** (spread máximo 50%, mínimo 1.5%)
- **Alta probabilidade** de mover na direção do sinal

### Como Identificar Oportunidades

1. **Procure mercados com spread entre 1.5% e 10%**  
   → Margem de manobra para scalping (1-3% de gain)

2. **Preferência por YES < 0.48 ou NO < 0.48**  
   → Preços claramente descontados

3. **Volume alto (>$50k)**  
   → Garante liquidez

4. **Tempo restante adequado**  
   → Mercados que expiram em semanas/meses (não minutos/horas)

### Exemplo Prático

| Mercado | YES | NO | Sinal | Spread |
|---------|-----|----|-------|--------|
| Will BTC hit $100k before 2026? | 0.47 | 0.53 | **BUY (YES)** | 3% |
| Will Fed raise rates in June? | 0.62 | 0.38 | **SELL (YES)** / BUY(NO) | 12% |

**Ação:** Comprar YES a 0.47, esperar subir para ~0.50-0.52, vender. Ganho potencial: 6-10%.

---

## 🔄 Ordenação e Priorização

O dashboard ordena as oportunidades por **spread crescente**:

```javascript
opportunities.sort((a, b) => a.maxSpread - b.maxSpread)
```

**Prioridade:**
1. Spread baixo (1.5% - 3%) - mais seguro
2. Spread médio (3% - 10%) - risco/retorno balanceado
3. Spread alto (10% - 50%) - maior risco, mas maior retorno potencial

---

## 📊 Métricas Exibidas

| Métrica | Descrição | Fórmula |
|---------|-----------|---------|
| **YES Price** | Preço do contrato "Sim" | Direto da API |
| **NO Price** | Preço do contrato "Não" | Direto da API |
| **Spread** | Distância de 50% do lado underpriced | `max(|yes-0.5|, |no-0.5|)` |
| **Volume** | Total negociado (USD) | `market.volume` |
| **Liquidity** | Liquidez disponível (USD) | `market.liquidity` |
| **Time Left** | Tempo até expiração | `endDate - now` |
| **Signal** | Recomendação de compra/venda | Baseado em `underpricedPrice` |

---

## ⚙️ Arquitetura Técnica

### Fluxo de Dados

```
Gamma API (Polymarket)
    ↓ Fetch (fetch.js - Node.js)
    ↓ Filtrar (spread, volume, timeLeft)
    ↓ Analisar (sinal)
    ↓ Gerar JSON (data.json)
    ↓ Template (index.html)
    ↓ Dashboard final (GitHub Pages)
```

### Componentes

#### `fetch.js`
- Busca mercados ativos da Gamma API
- Filtra por: `timeLeft > 0`, `volume >= 20000`, `spread 1.5%-50%`
- Calcula sinais
- Gera `data.json`

#### `generate.js`
- Substitui `%OPPORTUNITIES_JSON%` no template
- Produz `index.html` final

#### `index.html`
- Interface responsiva com Tailwind
- Cards interativos
- Filtros cliente (sinal, spread, tempo)
- Paginação (100 por página)

---

## 🕐 Atualização Automática

**GitHub Actions** roda a cada **5 minutos**:

```yaml
on:
  schedule:
    - cron: '*/5 * * * *'  # A cada 5 min
  push:
    branches: [main]
```

**Workflow:**
1. `node fetch.js` → baixa dados frescos
2. `npm run generate` → gera HTML
3. Commit & push → trigger Pages rebuild

---

## 🎓 Conceitos de Trading Aplicados

### 1. **Mean Reversion**
- Preços tendem a voltar para 0.5 (50%)
- Comprar quando está baixo (<0.48), vender quando alta (>0.52)

### 2. **Liquidity Premium**
- Mercados com pouco volume podem ter preços distorcidos
- Filtro de volume evita esses mercados ilíquidos

### 3. **Time Decay**
- Quanto mais próximo do fim, mais o preço converge para 0 ou 1
- Filtro `timeLeft > 0` evita mercados muito curtos (horas) que são puro gamble

### 4. **Risk Management**
- Spread máximo 50% evita mercados quase decididos (ex: 0.01 ou 0.99)
- Spread mínimo 1.5% garante margem para operar após fees

---

## 🚨 Limitações e Riscos

### Limitações da Estratégia

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Eventos de baixa liquidez** | Dificuldade para entrar/sair | Filtro volume >$20k |
| **Fee do Polymarket** ~2% | Come margem | Spread > 1.5% |
| **Manipulação de preço** (pequenos markets) | Preços temporariamente distorcidos | Volume alto + tempo restante |
| **Notícias repentinas** | Movimento rápido contra o sinal | Stop mental (não implementado) |
| **Expiração próxima** | Perda total se não在发生 | `timeLeft > 0` |

### O que o dashboard NÃO faz

- ❌ **Não executa trades automaticamente** - apenas sinaliza
- ❌ **Não tem stop-loss** - você deve gerenciar risco manualmente
- ❌ **Não considera fees de saque/depósito** - inclua na sua conta
- ❌ **Não garante lucro** - é apenas uma ferramenta de análise

---

## 📈 Exemplo de Análise

### Mercado: "Will Bitcoin hit $100k before 2026?"

**Dados da API:**
```
YES: 0.47 (47%)
NO:  0.53 (53%)
Volume: $500,000
Spread: 3% (lado YES)
Time left: 180 dias
```

**Análise:**
- Preço YES (0.47) está abaixo de 0.5 → subvalorizado
- Spread de 3%: boa margem após fees
- Volume alto: liquidez ok
- Tempo adequado: não está prestes a expirar

**Sinal:** `BUY` (YES)  
**Alvo:** 0.50-0.52 (ganho 6-10%)  
**Risco:** Perda de 3% se for para 0.44

---

## 🔧 Customização

### Ajustar Filtros (em `fetch.js`)

```javascript
// Aumentar volume mínimo
const MIN_VOLUME = 50000;

// Ajustar spread
const MIN_SPREAD = 0.02;  // 2%
const MAX_SPREAD = 0.30;  // 30%

// Tempo mínimo restante (ex: 7 dias)
const MIN_DAYS_LEFT = 7;
```

### Alterar Lógica de Sinal

```javascript
function getSignal(price, side) {
  // Ajuste os thresholds conforme sua tolerância a risco
  if (price < 0.45) return 'STRONG_BUY';  // mais conservador
  if (price < 0.48) return 'BUY';
  if (price < 0.52) return 'NEUTRAL';
  if (price < 0.55) return 'SELL';
  return 'STRONG_SELL';
}
```

---

## 📚 Referências

- **Gamma API Docs:** https://gamma-api.polymarket.com/
- **Polymarket:** https://polymarket.com/
- **Mean Reversion:** https://www.investopedia.com/terms/m/meanreversion.asp
- **Scalping Strategy:** https://www.investopedia.com/terms/s/scalping.asp

---

## ❓ FAQ

**Q: Por que alguns mercados não aparecem?**  
A: Não atendem aos filtros (volume muito baixo, spread muito alto/baixo, ou expirados).

**Q: O dashboard garante lucro?**  
A: Não. É uma ferramenta de análise. Você deve fazer sua própria due diligence.

**Q: Posso usar para automar trades?**  
A: Não é recomendado. O dashboard não tem conexão direta com a API de trading.

**Q: Com que frequência os dados são atualizados?**  
A: A cada 5 minutos via GitHub Actions.

**Q: Por que o sinal mudou de uma hora para outra?**  
A: Os preços de mercado mudam constantemente. O sinal é dinâmico.

---

## 🧠 Notas do Criador

*"Esta estratégia foi desenvolvida para identificar ineficiências de preço em mercados de predição. Não é garantia de lucro. Use com cautela e nunca arrisque mais do que pode perder."*

**— EmilIA, 2026**

---

**Última atualização:** 2026-02-11  
**Versão:** 1.0  
**Dashboard:** https://emalaman.github.io/scalping-strategy-dashboard/
