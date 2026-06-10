import React, { useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { API_BASE_URL } from '../../utils/api';
import { PlusIcon } from '@heroicons/react/24/solid';

export default function MenuCard({ item, shopOpen }) {
  const { addItem } = useContext(CartContext);

  const { id, name, description, price, imageUrl, isAvailable, category } = item;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isAvailable && shopOpen) {
      addItem(item);
    }
  };

  const imageSrc = imageUrl
    ? `${API_BASE_URL}/uploads/${imageUrl}`
    : null;

  const isSoldOut = !isAvailable;

  return (
    <div 
      className={`relative flex flex-col premium-card premium-card-hover rounded-xl overflow-hidden ${
        isSoldOut ? 'opacity-85' : ''
      }`}
    >
      {/* Price tag badge */}
      <div className="absolute top-sm right-sm z-10 bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-bold px-md py-xs rounded-full shadow-sm">
        ${parseFloat(price).toFixed(2)}
      </div>

      {/* Image container */}
      <div className="relative w-full h-[200px] bg-surface-container dark:bg-zinc-950 overflow-hidden group">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Premium fallback gradient decoration */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-fixed to-secondary-fixed dark:from-zinc-800 dark:to-zinc-900 text-on-primary-fixed/40">
            <span className="text-display-lg-mobile font-extrabold uppercase select-none opacity-20 dark:opacity-10">
              {category}
            </span>
            <span className="text-label-sm mt-xs opacity-75 dark:text-zinc-500">No Photo Available</span>
          </div>
        )}

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center">
            <span className="text-status-sold-out bg-error-container text-on-error-container text-label-md tracking-wider font-bold px-lg py-sm rounded-full shadow-md">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 p-md bg-surface-lowest dark:bg-zinc-900">
        {/* Category tag */}
        <span className="text-[10px] uppercase font-bold text-on-surface-variant/60 dark:text-zinc-400/60 tracking-wider mb-xs">
          {category}
        </span>
        
        {/* Item name */}
        <h3 className="text-title-md font-bold text-on-surface dark:text-zinc-100 mb-xs line-clamp-1">
          {name}
        </h3>
        
        {/* Description */}
        <p className="text-body-md text-on-surface-variant dark:text-zinc-400 mb-md flex-1 line-clamp-2">
          {description}
        </p>

        {/* Action Button */}
        <button
          onClick={handleAddToCart}
          disabled={isSoldOut || !shopOpen}
          className={`w-full flex items-center justify-center gap-xs py-sm px-md rounded-full font-bold text-label-md transition-all duration-200 ${
            isSoldOut
              ? 'bg-surface-dim dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-500 cursor-not-allowed'
              : !shopOpen
              ? 'bg-surface-dim dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-500 cursor-not-allowed'
              : 'bg-primary-container text-on-primary hover:bg-primary dark:bg-primary dark:hover:bg-primary-container hover:shadow-hover active:scale-[0.96]'
          }`}
        >
          {isSoldOut ? (
            'Sold Out'
          ) : !shopOpen ? (
            'Shop Closed'
          ) : (
            <>
              <PlusIcon className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
