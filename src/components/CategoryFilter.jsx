import React from 'react';

export default function CategoryFilter({ categories, currentCategory, onCategoryChange, counts }) {
  return (
    <div className="flex justify-center mb-8 flex-wrap gap-4 items-center">
      <label htmlFor="categoryFilter" className="text-gray-300 font-medium">
        Filter by Category:
      </label>
      <select
        id="categoryFilter"
        value={currentCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 bg-dark-800 border border-gray-700 rounded text-white font-medium focus:outline-none focus:border-primary-500"
      >
        <option value="All">All Categories ({counts.All})</option>
        {categories
          .filter(cat => cat !== 'All')
          .map(cat => (
            <option key={cat} value={cat}>
              {cat} ({counts[cat] || 0})
            </option>
          ))}
      </select>
    </div>
  );
}
