import React, { useState, useEffect, useContext } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { CalendarIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function AccountPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  useEffect(() => {
    // Fetch orders if user is logged in
    if (user) {
      const fetchOrders = async () => {
        try {
          setLoadingOrders(true);
          const res = await api.get('/api/orders/my');
          setOrders(res.data.data || []);
          setErrorOrders(null);
        } catch (err) {
          console.error('Failed to fetch user orders:', err);
          setErrorOrders('Could not load your order history. Please try again.');
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    }
  }, [user]);

  // Handle Loading Auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-body-md text-on-surface-variant">Loading account info...</p>
        </div>
      </div>
    );
  }

  // Guard: Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Status Badge styling mapper
  const getStatusStyle = (status) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-secondary-fixed text-on-secondary-fixed border-secondary-fixed-dim/30';
      case 'READY':
        return 'bg-status-ready-bg text-status-ready border-status-ready/25';
      case 'COMPLETED':
        return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
      default:
        return 'bg-surface-container-high text-on-surface';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-md py-xl sm:px-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        
        {/* Left column: User Profile Details */}
        <div className="lg:col-span-4 bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card">
          <h2 className="text-title-md font-bold text-on-surface mb-lg pb-sm border-b border-outline-variant/20 flex items-center gap-xs">
            <UserIcon className="h-5 w-5 text-primary" />
            Profile Details
          </h2>

          <div className="space-y-md">
            <div>
              <span className="block text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">
                Name
              </span>
              <p className="text-body-md font-bold text-on-surface mt-xs flex items-center gap-xs">
                {user.name}
              </p>
            </div>

            <div>
              <span className="block text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">
                Email
              </span>
              <p className="text-body-md font-medium text-on-surface-variant mt-xs flex items-center gap-xs">
                <EnvelopeIcon className="h-4 w-4 text-on-surface-variant/40" />
                {user.email}
              </p>
            </div>

            <div>
              <span className="block text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">
                Phone Number
              </span>
              <p className="text-body-md font-medium text-on-surface-variant mt-xs flex items-center gap-xs">
                <PhoneIcon className="h-4 w-4 text-on-surface-variant/40" />
                {user.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Past Orders list */}
        <div className="lg:col-span-8 space-y-lg">
          <div className="flex items-center justify-between pb-sm border-b border-outline-variant/20 mb-md">
            <h2 className="text-title-md font-bold text-on-surface">
              Order History
            </h2>
            <span className="bg-primary-fixed text-on-primary-fixed text-label-sm font-bold px-md py-xs rounded-full">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>

          {/* Orders Loading */}
          {loadingOrders && (
            <div className="space-y-md">
              {[1, 2].map(idx => (
                <div key={idx} className="bg-surface-lowest border border-outline-variant/20 rounded-xl h-[160px] animate-pulse p-md flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="bg-surface-container h-5 w-1/3 rounded" />
                    <div className="bg-surface-container h-6 w-1/6 rounded-full" />
                  </div>
                  <div className="bg-surface-container h-4 w-1/2 rounded" />
                  <div className="bg-surface-container h-8 w-full rounded mt-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Orders Error */}
          {!loadingOrders && errorOrders && (
            <div className="bg-error-container/30 border border-error/20 p-lg rounded-lg text-center max-w-lg mx-auto">
              <p className="text-body-md text-on-error-container font-semibold">{errorOrders}</p>
            </div>
          )}

          {/* Empty Orders list */}
          {!loadingOrders && !errorOrders && orders.length === 0 && (
            <div className="text-center py-2xl bg-surface-low rounded-xl border border-dashed border-outline-variant/30">
              <ShoppingBagIcon className="h-16 w-16 text-on-surface-variant/30 mx-auto mb-md" />
              <span className="text-headline-lg-mobile text-on-surface-variant/40 font-bold block mb-xs">
                No Orders Placed Yet
              </span>
              <p className="text-body-md text-on-surface-variant max-w-[280px] mx-auto mb-lg">
                Once you place order pickups, they will show up here.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-xs bg-primary-container text-on-primary text-label-sm font-bold px-lg py-xs rounded-full hover:bg-primary transition-all shadow-sm"
              >
                Order Now
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Chronological Orders list */}
          {!loadingOrders && !errorOrders && orders.length > 0 && (
            <div className="space-y-md">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card hover:shadow-hover transition-all duration-200"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm pb-md border-b border-outline-variant/20">
                    <div>
                      <h3 className="text-body-md font-bold text-on-surface">
                        Order #{order.id}
                      </h3>
                      <p className="text-label-sm text-on-surface-variant flex items-center gap-xs mt-0.5">
                        <CalendarIcon className="h-4 w-4 text-on-surface-variant/40" />
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <span className={`self-start sm:self-center border text-[10px] uppercase font-bold tracking-wider px-md py-sm rounded-full ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="py-md divide-y divide-outline-variant/10">
                    {order.orderItems?.map((item) => {
                      const price = parseFloat(item.unitPrice) || 0;
                      return (
                        <div key={item.id} className="py-sm flex justify-between items-center text-body-md">
                          <span className="text-on-surface font-medium">
                            {item.quantity} × {item.menuItem?.name || 'Item'}
                          </span>
                          <span className="text-on-surface-variant font-medium">
                            ${(price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Card Footer */}
                  <div className="flex justify-between items-center pt-md border-t border-outline-variant/20 mt-xs">
                    <div>
                      <span className="text-label-sm text-on-surface-variant">
                        Pickup Total
                      </span>
                      {order.discountApplied && (
                        <span className="text-[10px] bg-status-ready-bg text-status-ready font-extrabold px-sm py-xs rounded ml-sm">
                          5% Discount Saved
                        </span>
                      )}
                    </div>
                    <span className="text-title-md font-extrabold text-primary-container">
                      ${parseFloat(order.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
