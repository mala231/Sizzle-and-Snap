import React, { useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircleIcon, CalendarIcon, UserIcon, PhoneIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const order = location.state?.order;

  return (
    <div className="max-w-3xl mx-auto px-md py-2xl sm:px-lg">
      <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card text-center mb-xl">
        {/* Success Icon */}
        <CheckCircleIcon className="h-20 w-20 text-status-ready mx-auto mb-md animate-bounce" />
        
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight mb-xs">
          Order Placed Successfully!
        </h1>
        <p className="text-body-lg text-on-surface-variant font-medium">
          Your order ID is <span className="text-primary-container font-extrabold text-title-md">#{orderId}</span>
        </p>

        {/* Pickup Instructions Box */}
        <div className="bg-surface-low rounded-xl p-md sm:p-lg border border-outline-variant/20 text-left mt-lg space-y-md">
          <h3 className="text-title-md font-bold text-on-surface">Pickup & Payment Instructions</h3>
          <ol className="list-decimal list-inside space-y-sm text-body-md text-on-surface-variant font-medium">
            <li>Head to the counter at the shop (Sizzle & Snap).</li>
            <li>Tell our staff your order ID: <span className="text-on-surface font-extrabold">#{orderId}</span> or your name.</li>
            <li>Receive your freshly prepared food and pay using cash or card.</li>
          </ol>
          <div className="bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-bold p-sm rounded-lg text-center mt-sm">
            💡 Reminder: We hold pickup orders for up to 30 minutes from prep completion.
          </div>
        </div>
      </div>

      {order ? (
        /* Order Details Card */
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card space-y-lg">
          <h2 className="text-title-md font-bold text-on-surface pb-sm border-b border-outline-variant/20">
            Order Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md text-body-md text-on-surface-variant font-medium">
            <div className="flex items-center gap-sm">
              <UserIcon className="h-5 w-5 text-on-surface-variant/40" />
              <span>Customer: {order.customerName}</span>
            </div>
            <div className="flex items-center gap-sm">
              <PhoneIcon className="h-5 w-5 text-on-surface-variant/40" />
              <span>Phone: {order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-sm">
              <CalendarIcon className="h-5 w-5 text-on-surface-variant/40" />
              <span>Date: {new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Line Items */}
          <div className="divide-y divide-outline-variant/20 border-t border-b border-outline-variant/20 py-sm">
            {order.orderItems?.map((item) => {
              const unitPrice = parseFloat(item.unitPrice) || 0;
              return (
                <div key={item.id} className="py-md flex justify-between items-center gap-md">
                  <div>
                    <h4 className="text-body-md font-bold text-on-surface">
                      {item.menuItem?.name || 'Menu Item'}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant">
                      Qty: {item.quantity} × ${unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-label-md font-bold text-on-surface">
                    ${(unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pricing Block */}
          <div className="flex justify-between items-center pt-md">
            <div>
              <span className="text-title-md font-bold text-on-surface">Amount Due at Shop</span>
              {order.discountApplied && (
                <p className="text-label-sm text-status-ready font-semibold mt-0.5">
                  Registered Discount (5%) Applied
                </p>
              )}
            </div>
            <span className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-primary-container">
              ${parseFloat(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </div>
      ) : (
        /* Fallback message for direct page hits */
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card text-center text-body-md text-on-surface-variant">
          Detailed item breakdowns are only visible immediately after submitting an order. 
          If you are logged in, you can find full receipt history in your account.
        </div>
      )}

      {/* Action Links */}
      <div className="flex flex-col sm:flex-row gap-md justify-center items-center mt-xl">
        <Link
          to="/menu"
          className="w-full sm:w-auto text-center bg-primary-container text-on-primary text-label-md font-bold px-xl py-sm rounded-full hover:bg-primary active:scale-95 transition-all shadow-md"
        >
          Back to Menu
        </Link>
        {user && (
          <Link
            to="/account"
            className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-xs text-label-md font-bold text-primary hover:text-primary-container transition-colors py-sm px-xl"
          >
            Go to Account History
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
