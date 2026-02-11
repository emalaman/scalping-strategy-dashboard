/**
 * Formatters for numbers, percentages, dates, and time remaining
 */

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toLocaleString() || '0';
}

export function formatPercent(num) {
  return (num * 100).toFixed(2) + '%';
}

export function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatTimeLeft(ms) {
  if (!ms || ms <= 0) return 'Ended';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export function getSpreadColor(spread) {
  if (spread >= 0.025) return 'text-green-400';
  if (spread >= 0.02) return 'text-yellow-500';
  return 'text-orange-400';
}

export function getSideColor(side) {
  return side === 'YES' ? 'text-blue-400' : 'text-pink-400';
}

export function getSignal(side, price) {
  if (price < 0.48) return { text: 'STRONG BUY', color: 'bg-green-900/30 text-green-400 border-green-600' };
  if (price < 0.49) return { text: 'BUY', color: 'bg-blue-900/30 text-blue-400 border-blue-600' };
  if (price > 0.51) return { text: 'STRONG SELL', color: 'bg-red-900/30 text-red-400 border-red-600' };
  if (price > 0.5) return { text: 'SELL', color: 'bg-orange-900/30 text-orange-400 border-orange-600' };
  return { text: 'NEUTRAL', color: 'bg-gray-800 text-gray-400 border-gray-600' };
}
