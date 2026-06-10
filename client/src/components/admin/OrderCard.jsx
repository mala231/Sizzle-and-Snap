import React, { useState } from 'react';
import api from '../../utils/api';
import StatusBadge from './StatusBadge';
import { 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon, 
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';

export default function OrderCard({ order, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateStatus = async (newStatus) => {
    if (order.status === newStatus || updating) return;

    setUpdating(true);
    setError(null);

    try {
      await api.patch(`/api/orders/${order.id}/status`, { status: newStatus });
      if (onStatusChange) {
        await onStatusChange();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  // Helper styles for status buttons
  const getButtonClass = (statusType, currentStatus) => {
    const isCurrent = currentStatus.toLowerCase() === statusType.toLowerCase();
    const base = 'flex-1 text-[11px] font-extrabold uppercase tracking-wider py-sm px-xs border rounded-lg transition-all duration-150 active:scale-[0.98]';
    
    if (isCurrent) {
      switch (statusType.toLowerCase()) {
        case 'pending':
          return `${base} bg-[#ffdcc3] border-[#fd8b00]/30 text-[#603100] cursor-default`;
        case 'ready':
          return `${base} bg-[#c8f0d2] border-[#1a6b2a]/30 text-[#0d3d18] cursor-default`;
        case 'completed':
          return `${base} bg-[#e5e2e1] border-[#3a3a3a]/20 text-[#1c1b1b] cursor-default`;
        default:
          return `${base} bg-surface-container border-outline/30 text-on-surface cursor-default`;
      }
    } else {
      return `${base} bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary/30 hover:bg-surface-container-high`;
    }
  };

  return (
    <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card hover:shadow-hover transition-all duration-200 flex flex-col justify-between h-full">
      <div>
        {/* Card Header: Order ID & Badge */}
        <div className="flex justify-between items-center gap-xs pb-sm border-b border-outline-variant/10">
          <div>
            <h3 className="text-label-md font-bold text-on-surface">
              Order #{order.id}
            </h3>
            <span className="text-[10px] text-on-surface-variant/50 font-mono tracking-tighter">
              UID: {order.userId ? `User #${order.userId}` : 'Guest Pickup'}
            </span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Customer Details */}
        <div className="py-md space-y-xs border-b border-outline-variant/10">
          <div className="flex items-center gap-sm text-body-md text-on-surface font-semibold">
            <UserIcon className="h-4 w-4 text-on-surface-variant/40 shrink-0" />
            <span>{order.customerName}</span>
          </div>
          <div className="flex items-center gap-sm text-body-md text-on-surface-variant">
            <PhoneIcon className="h-4 w-4 text-on-surface-variant/40 shrink-0" />
            <a href={`tel:${order.customerPhone}`} className="hover:text-primary transition-colors font-medium">
              {order.customerPhone}
            </a>
          </div>
          <div className="flex items-center gap-sm text-label-sm text-on-surface-variant/60">
            <CalendarIcon className="h-4 w-4 text-on-surface-variant/40 shrink-0" />
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Ordered items receipt list */}
        <div className="py-md border-b border-outline-variant/10">
          <span className="block text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider mb-xs flex items-center gap-xs">
            <ShoppingBagIcon className="h-4 w-4 text-on-surface-variant/40" />
            Items Ordered
          </span>
          <div className="divide-y divide-outline-variant/10 max-h-[140px] overflow-y-auto pr-xs">
            {order.orderItems?.map((item) => (
              <div key={item.id} className="py-sm flex justify-between items-center text-body-md">
                <span className="text-on-surface font-medium">
                  {item.quantity} × {item.menuItem?.name || 'Item'}
                </span>
                <span className="text-on-surface-variant font-medium text-label-sm">
                  ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        {/* Total & Discount Summary */}
        <div className="flex justify-between items-center py-md">
          <div className="flex flex-col">
            <span className="text-label-sm text-on-surface-variant">
              Grand Total
            </span>
            {order.discountApplied && (
              <span className="text-[10px] bg-status-ready-bg text-status-ready font-extrabold px-sm py-0.5 rounded mt-xs self-start">
                5% Discount Saved
              </span>
            )}
          </div>
          <span className="text-title-md font-extrabold text-primary-container">
            ${parseFloat(order.totalAmount || 0).toFixed(2)}
          </span>
        </div>

        {/* Inline Status Action Controls */}
        <div className="pt-sm border-t border-outline-variant/10">
          <span className="block text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/50 mb-sm">
            Update Status
          </span>
          <div className="flex gap-xs">
            <button
              onClick={() => handleUpdateStatus('pending')}
              disabled={updating}
              className={getButtonClass('pending', order.status)}
            >
              Pending
            </button>
            <button
              onClick={() => handleUpdateStatus('ready')}
              disabled={updating}
              className={getButtonClass('ready', order.status)}
            >
              Ready
            </button>
            <button
              onClick={() => handleUpdateStatus('completed')}
              disabled={updating}
              className={getButtonClass('completed', order.status)}
            >
              Completed
            </button>
          </div>
          {error && (
            <p className="text-error text-label-sm font-bold mt-sm text-center">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
