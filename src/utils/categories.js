/**
 * Category inference using regex patterns on question and eventSlug
 */

export function inferCategory(question, eventSlug) {
  const text = (question + ' ' + (eventSlug || '')).toLowerCase();

  // Politics / Elections
  if (/\b(election|elect|vote|voter|trump|biden|senate|congress|governor|presidential|primary|ballot|poll)\b/.test(text)) return 'Elections';
  if (/\b(politics|political|government|policy|legislation|senator|congressman|partisan)\b/.test(text)) return 'Politics';

  // Sports
  if (/\b(sport|game|match|team|player|win|lose|score|tournament|championship|league|nfl|nba|mlb|soccer|football|tennis|golf|olympic|world cup|nhl|fifa|champions league|la liga|bundesliga|serie a|premier league)\b/.test(text)) return 'Sports';

  // Crypto
  if (/\b(crypto|bitcoin|ethereum|blockchain|coin|token|defi|nft|web3|btc|eth|solana|cardano|polkadot)\b/.test(text)) return 'Crypto';

  // Finance
  if (/\b(stock|market|bond|interest|rate|inflation|fed|federal reserve|bank|investment|trading|dividend|ipo|merger|acquisition)\b/.test(text)) return 'Finance';

  // Geopolitics
  if (/\b(war|conflict|military|army|nation|country|alliance|treaty|invasion|sanction|un|nato|russia|ukraine|israel|iran|china|taiwan|putin|zelenskyy|erdoğan|xi|foreign)\b/.test(text)) return 'Geopolitics';

  // Earnings
  if (/\b(earnings|revenue|profit|loss|quarterly|annual|fiscal|guidance|earnings call|eps|net income)\b/.test(text)) return 'Earnings';

  // Tech
  if (/\b(tech|technology|software|hardware|startup|ai|artificial intelligence|app|application|platform|internet|cloud|data|computing|processor|chip|semiconductor|megaeth)\b/.test(text)) return 'Tech';

  // Culture
  if (/\b(movie|film|music|award|oscar|grammy|artist|celebrity|tv|television|streaming|netflix|disney|hollywood|entertainment)\b/.test(text)) return 'Culture';

  // World
  if (/\b(world|global|international|worldwide|embassy|diplomat|united nations)\b/.test(text)) return 'World';

  // Economy
  if (/\b(economy|economic|gdp|unemployment|jobs|labor|wage|consumer|spending|recession|growth|deflation|stagflation|tariff|revenue|tax)\b/.test(text)) return 'Economy';

  // Climate & Science
  if (/\b(climate|environment|carbon|emission|global warming|temperature|weather|hurricane|earthquake|disaster|pollution|green|sustainability|renewable)\b/.test(text)) return 'Climate & Science';
  if (/\b(science|research|discovery|space|nasa|rocket|physics|biology|chemistry|medicine|vaccine|disease|virus|pandemic)\b/.test(text)) return 'Climate & Science';

  // Mentions
  if (/\b(mentions|mentioned)\b/.test(text)) return 'Mentions';

  return 'Other';
}

export const CATEGORY_COLORS = {
  'Sports': 'bg-blue-900/20 text-blue-300 border-blue-700',
  'Elections': 'bg-purple-900/20 text-purple-300 border-purple-700',
  'Earnings': 'bg-green-900/20 text-green-300 border-green-700',
  'Crypto': 'bg-orange-900/20 text-orange-300 border-orange-700',
  'Finance': 'bg-teal-900/20 text-teal-300 border-teal-700',
  'Geopolitics': 'bg-red-900/20 text-red-300 border-red-700',
  'Tech': 'bg-cyan-900/20 text-cyan-300 border-cyan-700',
  'Culture': 'bg-pink-900/20 text-pink-300 border-pink-700',
  'World': 'bg-indigo-900/20 text-indigo-300 border-indigo-700',
  'Economy': 'bg-yellow-900/20 text-yellow-300 border-yellow-700',
  'Climate & Science': 'bg-emerald-900/20 text-emerald-300 border-emerald-700',
  'Mentions': 'bg-gray-700/20 text-gray-300 border-gray-600',
  'Other': 'bg-gray-800/20 text-gray-300 border-gray-600',
  'Politics': 'bg-amber-900/20 text-amber-300 border-amber-700',
};
