import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import useShopStatus from '../../hooks/useShopStatus';
import api from '../../utils/api';
import { applyDiscount } from '../../utils/discount';
import { ShoppingBagIcon, ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function CheckoutPage() {
  const { user } = useContext(AuthContext);
  const { items, total, clearCart } = useContext(CartContext);
  const { isOpen, loading: statusLoading } = useShopStatus();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Sync with auth user details if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const isCustomer = user && user.role === 'customer';
  const finalTotal = applyDiscount(total, isCustomer);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOpen) {
      setSubmitError('The shop is currently closed. We cannot process orders at this time.');
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setSubmitError('Please fill in both your name and phone number.');
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty. Add some food to checkout!');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      customerName: name.trim(),
      customerPhone: phone.trim(),
      items: items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await api.post('/api/orders', payload);
      const order = response.data.data;
      clearCart();
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to place the order. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, show empty state message
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-xl mx-auto px-md py-3xl text-center">
        <div className="bg-surface-low rounded-xl border border-dashed border-outline-variant/40 p-2xl">
          <ShoppingBagIcon className="h-16 w-16 text-on-surface-variant/30 mx-auto mb-md" />
          <h2 className="text-headline-lg-mobile font-extrabold text-on-background mb-xs">
            Your Cart is Empty
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-[320px] mx-auto mb-lg">
            Add some delicious items from our menu before proceeding to checkout.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-xs bg-primary-container text-on-primary text-label-md font-bold px-xl py-sm rounded-full hover:bg-primary active:scale-95 transition-all shadow-md"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-md py-xl sm:px-lg">
      {/* Back to menu button */}
      <div className="mb-lg">
        <Link to="/menu" className="inline-flex items-center gap-xs text-label-md font-bold text-primary hover:text-primary-container transition-colors">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Menu
        </Link>
      </div>

      <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background mb-xl tracking-tight">
        Checkout
      </h1>

      {/* Closed shop banner warning */}
      {!isOpen && !statusLoading && (
        <div className="bg-error-container text-on-error-container p-md rounded-xl font-bold text-label-md text-center mb-lg border border-error/20">
          🚨 We are currently CLOSED. Ordering is disabled. Operating hours are 10:00 AM – 4:00 PM.
        </div>
      )}

      {/* Guest login nudge banner */}
      {!user && (
        <div className="bg-primary-fixed text-on-primary-fixed p-md rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-lg shadow-sm border border-primary-fixed-dim/20">
          <div>
            <p className="text-label-md font-extrabold">Want to save 5% on your order?</p>
            <p className="text-label-sm text-on-primary-fixed-variant mt-0.5">Log in or create a free account to apply the discount automatically.</p>
          </div>
          <div className="flex gap-sm w-full md:w-auto">
            <Link to="/login" className="flex-1 md:flex-none text-center bg-surface-lowest text-primary text-label-sm font-bold px-md py-xs rounded-full hover:bg-surface-container transition-colors border border-outline-variant/20 shadow-xs">
              Log In
            </Link>
            <Link to="/register" className="flex-1 md:flex-none text-center bg-primary-container text-on-primary text-label-sm font-bold px-md py-xs rounded-full hover:bg-primary transition-colors shadow-xs">
              Register
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-lg">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card">
            <h2 className="text-title-md font-bold text-on-surface mb-lg pb-sm border-b border-outline-variant/20">
              Pickup Information
            </h2>

            <form onSubmit={handleSubmit} className="space-y-md">
              {submitError && (
                <div className="bg-error-container/40 border border-error/20 p-md rounded-lg text-on-error-container text-label-md font-bold">
                  {submitError}
                </div>
              )}

              <div>
                <label className="block text-label-sm font-bold text-on-surface-variant mb-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!user || isSubmitting}
                  className={`w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all ${
                    user ? 'opacity-75 cursor-not-allowed bg-surface-dim' : ''
                  }`}
                  required
                />
                {user && (
                  <p className="text-[11px] text-on-surface-variant/60 mt-xs">
                    Pre-filled from your registered account.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-label-sm font-bold text-on-surface-variant mb-sm">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!!user || isSubmitting}
                  className={`w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all ${
                    user ? 'opacity-75 cursor-not-allowed bg-surface-dim' : ''
                  }`}
                  required
                />
                {user && (
                  <p className="text-[11px] text-on-surface-variant/60 mt-xs">
                    Pre-filled from your registered account.
                  </p>
                )}
              </div>

              <div className="bg-surface-low rounded-lg p-md border border-outline-variant/20 flex gap-sm items-start">
                <CreditCardIcon className="h-5 w-5 text-primary-container mt-xs" />
                <div>
                  <h4 className="text-label-md font-bold text-on-surface">Pay at the Counter</h4>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">
                    No online payment needed! Collect your food and pay cash or card at pickup.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isOpen}
                className={`w-full bg-primary-container text-on-primary text-label-md font-bold py-md rounded-full shadow-md transition-all active:scale-[0.98] mt-lg ${
                  isSubmitting || !isOpen
                    ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed shadow-none'
                    : 'hover:bg-primary hover:shadow-hover'
                }`}
              >
                {isSubmitting ? 'Processing Order...' : !isOpen ? 'Shop Closed' : 'Place Pickup Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card sticky top-20">
            <h2 className="text-title-md font-bold text-on-surface mb-lg pb-sm border-b border-outline-variant/20">
              Order Summary
            </h2>

            {/* Item list */}
            <div className="divide-y divide-outline-variant/20 max-h-[300px] overflow-y-auto pr-xs">
              {items.map((item) => {
                const itemPrice = parseFloat(item.price) || 0;
                return (
                  <div key={item.id} className="py-md flex items-center justify-between gap-md">
                    <div className="min-w-0">
                      <p className="text-body-md font-bold text-on-surface truncate">{item.name}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        Qty: {item.quantity} × ${itemPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-label-md font-bold text-on-surface whitespace-nowrap">
                      ${(itemPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totals Block */}
            <div className="border-t border-outline-variant/30 pt-md mt-md space-y-sm">
              {isCustomer ? (
                <>
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-body-md text-status-ready">
                    <span>Registered Discount (5%):</span>
                    <span>-${(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-title-md font-extrabold text-on-surface border-t border-outline-variant/20 pt-sm mt-xs">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-title-md font-extrabold text-on-surface">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
