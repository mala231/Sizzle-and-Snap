import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { applyDiscount } from '../../utils/discount';
import { XMarkIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, updateQuantity, removeItem, total, itemCount } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isCustomer = user && user.role === 'customer';
  const finalTotal = applyDiscount(total, isCustomer);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop scrim */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-surface-lowest shadow-modal flex flex-col h-full animate-slide-in">
          
          {/* Header */}
          <div className="px-md py-lg border-b border-outline-variant/30 flex items-center justify-between">
            <h2 className="text-title-md font-bold text-on-background flex items-center gap-xs">
              Your Cart 
              <span className="bg-primary-container text-on-primary text-label-sm px-sm py-xs rounded-full font-bold">
                {itemCount}
              </span>
            </h2>
            <button 
              onClick={onClose}
              className="p-sm text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <span className="text-headline-lg-mobile text-on-surface-variant/20 font-bold block mb-xs">
                  Empty Cart
                </span>
                <p className="text-body-md text-on-surface-variant max-w-[240px]">
                  Add delicious food from our menu to get started!
                </p>
              </div>
            ) : (
              items.map((item) => {
                const imageSrc = item.imageUrl
                  ? `http://localhost:5000/uploads/${item.imageUrl}`
                  : null;
                const itemPrice = parseFloat(item.price) || 0;

                return (
                  <div key={item.id} className="flex gap-md bg-surface-low p-sm rounded-lg border border-outline-variant/20 shadow-xs">
                    {/* Item Image */}
                    <div className="w-[80px] h-[80px] bg-surface-container rounded-md overflow-hidden flex-shrink-0">
                      {imageSrc ? (
                        <img src={imageSrc} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-fixed to-secondary-fixed text-[10px] font-bold text-on-primary-fixed/40">
                          {item.category[0]}
                        </div>
                      )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-xs">
                        <h4 className="text-body-md font-bold text-on-surface truncate pr-sm">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-xs"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="text-label-sm text-on-surface-variant mb-auto">
                        ${itemPrice.toFixed(2)} each
                      </p>

                      {/* Stepper and total item price */}
                      <div className="flex items-center justify-between mt-sm">
                        <div className="flex items-center bg-surface-container rounded-full border border-outline-variant/40 px-xs py-xs scale-90 origin-left">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-xs text-on-surface rounded-full hover:bg-surface-lowest transition-colors"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <span className="text-label-md font-bold text-on-surface min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-xs text-on-surface rounded-full hover:bg-surface-lowest transition-colors"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <span className="text-label-md font-bold text-on-surface">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer summary block */}
          {items.length > 0 && (
            <div className="p-md bg-surface-low border-t border-outline-variant/30 space-y-md shadow-inner">
              <div className="space-y-xs">
                {isCustomer ? (
                  <>
                    <div className="flex justify-between text-body-md text-on-surface-variant">
                      <span>Subtotal:</span>
                      <span className="line-through">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-body-md text-status-ready">
                      <span>Registered Discount (5%):</span>
                      <span>-${(total * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-title-md font-extrabold text-on-surface border-t border-outline-variant/20 pt-xs">
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
                {!user && (
                  <p className="text-[11px] text-primary/80 font-medium bg-primary-fixed text-on-primary-fixed px-sm py-xs rounded mt-sm text-center">
                    💡 Register or Log In to automatically save 5% on your order!
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary-container text-on-primary text-label-md font-bold py-md rounded-full shadow-md hover:bg-primary active:scale-[0.98] transition-all duration-200"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
