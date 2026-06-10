import React, { useState, useEffect, useRef } from 'react';
import useOrders from '../../hooks/useOrders';
import OrderCard from '../../components/admin/OrderCard';
import { 
  BellIcon, 
  InboxIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

// Synthesized Audio chime using Web Audio API (no external file asset dependency)
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    playTone(523.25, now, 0.15); // C5
    playTone(659.25, now + 0.12, 0.3); // E5
  } catch (err) {
    console.error('Audio synthesizer error:', err);
  }
};

export default function OrdersPage() {
  const { orders, loading, error, refetch } = useOrders();
  const [filter, setFilter] = useState('all');
  const [showAlert, setShowAlert] = useState(false);
  const prevOrdersRef = useRef([]);
  const alertTimeoutRef = useRef(null);

  // Monitor incoming orders to play alert & chime
  useEffect(() => {
    if (orders.length > 0) {
      if (prevOrdersRef.current.length > 0) {
        // Find if any order id in current orders list is NOT in previous list
        const prevIds = new Set(prevOrdersRef.current.map(o => o.id));
        const hasNew = orders.some(o => !prevIds.has(o.id));
        
        if (hasNew) {
          playChime();
          setShowAlert(true);
          
          // Clear any active timeout
          if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current);
          }
          // Reset alert banner after 5 seconds
          alertTimeoutRef.current = setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        }
      }
      prevOrdersRef.current = orders;
    }
  }, [orders]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  // Filter computations
  const pendingOrders = orders.filter(o => o.status.toLowerCase() === 'pending');
  const readyOrders = orders.filter(o => o.status.toLowerCase() === 'ready');
  const completedOrders = orders.filter(o => o.status.toLowerCase() === 'completed');

  const getFilteredOrders = () => {
    switch (filter) {
      case 'pending': return pendingOrders;
      case 'ready': return readyOrders;
      case 'completed': return completedOrders;
      default: return orders;
    }
  };

  const filteredOrdersList = getFilteredOrders();

  return (
    <div className="max-w-7xl mx-auto space-y-lg">
      
      {/* Alert Banner for New Orders */}
      {showAlert && (
        <div className="bg-[#ffdcc3] border border-[#fd8b00]/30 rounded-xl p-md flex items-center justify-between shadow-modal animate-bounce">
          <div className="flex items-center gap-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fd8b00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#fd8b00]"></span>
            </span>
            <span className="text-body-md font-bold text-[#603100] flex items-center gap-xs">
              <BellIcon className="h-5 w-5 text-[#fd8b00]" />
              New Pickup Order Received!
            </span>
          </div>
          <button 
            onClick={() => setShowAlert(false)}
            className="text-label-sm font-bold text-[#603100]/60 hover:text-[#603100] transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant/20 pb-md">
        <div>
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Orders Feed
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Monitor incoming pickup receipts and update food preparation statuses
          </p>
        </div>

        <div className="flex items-center gap-sm">
          <button 
            onClick={() => refetch()}
            className="inline-flex items-center gap-xs bg-surface-lowest hover:bg-surface-container border border-outline-variant/30 text-on-surface-variant text-label-sm font-semibold px-md py-xs rounded-full shadow-sm active:scale-[0.98] transition-all"
            title="Refresh Feed"
          >
            <ArrowPathIcon className="h-4 w-4 text-on-surface-variant" />
            Refresh
          </button>
          <span className="text-[11px] bg-secondary-fixed text-on-secondary-fixed font-bold uppercase tracking-wider px-md py-xs rounded-full border border-secondary-fixed-dim/20 flex items-center gap-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#fd8b00] animate-pulse" />
            Live Polling
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-xs border-b border-outline-variant/10 pb-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-lg py-sm font-bold text-label-md rounded-xl transition-all border ${
            filter === 'all'
              ? 'bg-primary-container text-on-primary border-primary-container shadow-sm'
              : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-lg py-sm font-bold text-label-md rounded-xl transition-all border flex items-center gap-xs ${
            filter === 'pending'
              ? 'bg-[#ffdcc3] border-[#fd8b00]/25 text-[#603100] shadow-sm font-extrabold'
              : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          Pending ({pendingOrders.length})
        </button>
        <button
          onClick={() => setFilter('ready')}
          className={`px-lg py-sm font-bold text-label-md rounded-xl transition-all border flex items-center gap-xs ${
            filter === 'ready'
              ? 'bg-[#c8f0d2] border-[#1a6b2a]/25 text-[#0d3d18] shadow-sm font-extrabold'
              : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          Ready ({readyOrders.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-lg py-sm font-bold text-label-md rounded-xl transition-all border flex items-center gap-xs ${
            filter === 'completed'
              ? 'bg-[#e5e2e1] border-[#3a3a3a]/15 text-[#1c1b1b] shadow-sm font-extrabold'
              : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:bg-surface-container'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      {/* Main content grid */}

      {/* Loading Skeletons */}
      {loading && orders.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[1, 2, 3].map(idx => (
            <div 
              key={idx} 
              className="bg-surface-lowest border border-outline-variant/20 rounded-xl h-[340px] p-md flex flex-col justify-between animate-pulse"
            >
              <div className="space-y-md">
                <div className="flex justify-between items-center">
                  <div className="bg-surface-container h-5 w-1/3 rounded" />
                  <div className="bg-surface-container h-6 w-1/4 rounded-full" />
                </div>
                <div className="space-y-xs pt-xs border-t border-outline-variant/10">
                  <div className="bg-surface-container h-4 w-1/2 rounded" />
                  <div className="bg-surface-container h-4 w-2/3 rounded" />
                </div>
                <div className="space-y-xs pt-md border-t border-outline-variant/10">
                  <div className="bg-surface-container h-4 w-full rounded" />
                  <div className="bg-surface-container h-4 w-5/6 rounded" />
                </div>
              </div>
              <div className="bg-surface-container h-8 w-full rounded mt-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-2xl max-w-md mx-auto">
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-xl flex flex-col items-center gap-md">
            <ExclamationTriangleIcon className="h-12 w-12 text-error" />
            <h3 className="text-title-md font-bold text-on-surface">
              Failed to load orders feed
            </h3>
            <p className="text-body-md text-on-surface-variant mb-sm">
              {error}
            </p>
            <button 
              onClick={() => refetch()}
              className="bg-primary-container text-on-primary text-label-md font-bold px-lg py-xs rounded-full hover:bg-primary transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Orders Grid Display */}
      {!loading && !error && filteredOrdersList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {filteredOrdersList.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onStatusChange={refetch} 
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrdersList.length === 0 && (
        <div className="text-center py-3xl bg-surface-low rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-lg">
          <InboxIcon className="h-16 w-16 text-on-surface-variant/20 mb-md" />
          <h3 className="text-headline-lg-mobile text-on-surface-variant/40 font-bold tracking-tight">
            No Orders to Show
          </h3>
          <p className="text-body-md text-on-surface-variant/60 max-w-xs mt-xs">
            {filter === 'all' 
              ? 'Incoming customer pickup receipts will display here in real time.'
              : `There are currently no orders in status "${filter.toUpperCase()}".`
            }
          </p>
        </div>
      )}

    </div>
  );
}
