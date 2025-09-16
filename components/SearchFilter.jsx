'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function SearchFilter({ onSearch, onFilter, searchTerm, currentFilter }) {
  const [localSearch, setLocalSearch] = useState(searchTerm || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  const filterOptions = [
    { value: 'all', label: 'All Candidates', count: null },
    { value: 'not_conducted', label: 'Not Conducted', color: 'text-red-600' },
    { value: 'one_interview', label: '1 Interview', color: 'text-yellow-600' },
    { value: 'two_interviews', label: '2 Interviews', color: 'text-green-600' },
    { value: 'three_plus', label: '3+ Interviews', color: 'text-purple-600' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search Section */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Candidates
          </label>
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {localSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        {/* Filter Section */}
        <div className="lg:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={currentFilter}
              onChange={(e) => onFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || currentFilter !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
              <button
                onClick={() => onSearch('')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentFilter !== 'all' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {filterOptions.find(f => f.value === currentFilter)?.label}
              <button
                onClick={() => onFilter('all')}
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}