import { useState, useEffect, useMemo, useCallback } from 'react';
import opportunitiesData from '../data/opportunities.json';

const PAGE_SIZE = 50;

export default function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');

  // Fetch on mount (in case we want real API later)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // For now we use the static JSON generated at build time
        // If you want live fetch, uncomment below and adjust
        /*
        const res = await fetch('/data/opportunities.json');
        if (!res.ok) throw new Error('Failed to fetch data');
        const json = await res.json();
        setOpportunities(json.opportunities || []);
        setLastUpdate(json.generatedAt);
        */
        // Use embedded data
        setOpportunities(opportunitiesData.opportunities || []);
        setLastUpdate(opportunitiesData.generatedAt);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Group by category for counts
  const categoryCounts = useMemo(() => {
    const counts = { All: opportunities.length };
    opportunities.forEach(opp => {
      const cat = opp.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  // Unique categories sorted
  const categories = useMemo(() => {
    const cats = [...new Set(opportunities.map(opp => opp.category || 'Other'))];
    return cats.sort();
  }, [opportunities]);

  // Filter logic
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOpportunities = useMemo(() => {
    if (currentCategory === 'All') return opportunities;
    return opportunities.filter(opp => (opp.category || 'Other') === currentCategory);
  }, [opportunities, currentCategory]);

  const totalPages = Math.ceil(filteredOpportunities.length / PAGE_SIZE);

  const paginatedOpportunities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredOpportunities.slice(start, end);
  }, [filteredOpportunities, currentPage]);

  const goToPage = useCallback((page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  }, [totalPages]);

  const changeCategory = useCallback((cat) => {
    setCurrentCategory(cat);
    setCurrentPage(1);
  }, []);

  return {
    opportunities: paginatedOpportunities,
    loading,
    error,
    lastUpdate,
    categories,
    categoryCounts,
    currentCategory,
    currentPage,
    totalPages,
    totalCount: opportunities.length,
    goToPage,
    changeCategory,
  };
}
