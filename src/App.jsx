import React, { useMemo } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CategoryFilter from './components/CategoryFilter';
import Pagination from './components/Pagination';
import MarketCard from './components/MarketCard';
import useOpportunities from './hooks/useOpportunities';
import { formatNumber } from './utils/formatters';

export default function App() {
  const {
    opportunities,
    loading,
    error,
    lastUpdate,
    categories,
    categoryCounts,
    currentCategory,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    changeCategory,
  } = useOpportunities();

  const formattedLastUpdate = useMemo(() => {
    if (!lastUpdate) return '';
    const d = new Date(lastUpdate);
    return d.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastUpdate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 5 * 60 * 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
          <p className="text-gray-500">Fetching opportunities</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-500">{error}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-primary-600 rounded hover:bg-primary-700 transition text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header
          totalCount={totalCount}
          lastUpdate={formattedLastUpdate}
          filters={{ minSpread: 0.015, maxSpread: 0.50, minVolume: 50000 }}
          onRefresh={handleRefresh}
        />

        <CategoryFilter
          categories={categories}
          currentCategory={currentCategory}
          onCategoryChange={changeCategory}
          counts={categoryCounts}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

        {totalCount === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No scalping opportunities right now</h3>
            <p className="text-gray-500">Spreads are too tight or markets are balanced. Check back later when volatility increases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {opportunities.map(opp => (
              <MarketCard key={opp.id} opp={opp} />
            ))}
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />

        <Footer filters={{ minSpread: 0.015, maxSpread: 0.50, minVolume: 50000 }} />
      </div>
    </div>
  );
}
