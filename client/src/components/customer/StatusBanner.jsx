import React from 'react';
import useShopStatus from '../../hooks/useShopStatus';

export default function StatusBanner() {
  const { isOpen, openTime, closeTime, loading, error } = useShopStatus();

  if (loading) {
    return (
      <div className="w-full bg-surface-container animate-pulse py-sm text-center">
        <span className="text-label-sm text-on-surface-variant">Checking shop status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-error/10 border-b border-error/20 py-sm text-center">
        <span className="text-label-sm text-error font-medium">{error} Ordering might be restricted.</span>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="w-full bg-status-ready/10 border-b border-status-ready/20 py-md px-md transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-sm">
          <div className="flex items-center gap-sm">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-ready opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-status-ready"></span>
            </span>
            <span className="text-label-md text-status-ready font-bold tracking-wide">WE'RE OPEN!</span>
            <span className="text-body-md text-on-surface-variant hidden sm:inline">
              | Place your pickup order online now. Collect and pay at the shop!
            </span>
          </div>
          <span className="text-label-sm text-status-ready bg-status-ready/15 px-sm py-xs rounded-full">
            Hours: {openTime} - {closeTime}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-status-sold-out/10 border-b border-status-sold-out/20 py-md px-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-sm">
        <div className="flex items-center gap-sm">
          <span className="inline-block h-3 w-3 rounded-full bg-status-sold-out"></span>
          <span className="text-label-md text-status-sold-out font-bold tracking-wide">WE'RE CLOSED</span>
          <span className="text-body-md text-on-surface-variant hidden sm:inline">
            | Ordering is currently disabled. We look forward to serving you during open hours!
          </span>
        </div>
        <span className="text-label-sm text-status-sold-out bg-status-sold-out/15 px-sm py-xs rounded-full font-semibold">
          Opens at {openTime}
        </span>
      </div>
    </div>
  );
}
