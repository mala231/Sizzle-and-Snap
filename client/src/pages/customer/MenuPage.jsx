import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import useShopStatus from '../../hooks/useShopStatus';
import StatusBanner from '../../components/customer/StatusBanner';
import MenuCard from '../../components/customer/MenuCard';
import { CATEGORIES } from '../../constants';

// Categories filter list including "All"
const FILTER_CATEGORIES = ['All', ...CATEGORIES];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const { isOpen } = useShopStatus();

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/menu');
      setItems(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setError('Could not load the menu. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Dynamic Shop Status Banner */}
      <StatusBanner />

      {/* Main page wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-md py-xl sm:px-lg">
        
        {/* Header Title */}
        <div className="text-center sm:text-left mb-xl">
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Our Menu
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Browse our fresh burgers, golden crispy sides, cold drinks, and sweet snacks.
          </p>
        </div>

        {/* Category Filters row */}
        <div className="flex items-center gap-sm overflow-x-auto pb-md mb-xl no-scrollbar scroll-smooth">
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-lg py-xs rounded-full font-bold text-label-md transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm scale-102'
                    : 'bg-surface-highest text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Data Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-surface-lowest rounded-xl h-[380px] animate-pulse flex flex-col">
                <div className="bg-surface-container h-[200px] w-full" />
                <div className="p-md flex-1 flex flex-col gap-sm">
                  <div className="bg-surface-container h-4 w-1/3 rounded" />
                  <div className="bg-surface-container h-6 w-3/4 rounded" />
                  <div className="bg-surface-container h-4 w-full rounded mt-xs" />
                  <div className="bg-surface-container h-4 w-full rounded" />
                  <div className="bg-surface-container h-10 w-full rounded-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Alert State */}
        {!loading && error && (
          <div className="bg-error-container/30 border border-error/20 p-lg rounded-lg text-center max-w-lg mx-auto">
            <p className="text-body-md text-on-error-container font-semibold">{error}</p>
            <button
              onClick={fetchMenu}
              className="mt-md bg-error text-on-error px-lg py-xs rounded-full text-label-md font-bold hover:bg-error/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredItems.length === 0 && (
          <div className="text-center py-2xl bg-surface-low rounded-xl border border-dashed border-outline-variant/30">
            <span className="text-headline-lg-mobile text-on-surface-variant/40 font-bold block mb-xs">
              No Items Found
            </span>
            <p className="text-body-md text-on-surface-variant">
              We couldn't find any items in the "{selectedCategory}" category right now.
            </p>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} shopOpen={isOpen} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
