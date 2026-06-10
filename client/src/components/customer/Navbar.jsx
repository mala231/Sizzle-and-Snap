import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar({ onOpenCart }) {
  const { itemCount } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-none">
      <div className="max-w-7xl mx-auto px-md sm:px-lg h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-xs">
          <span className="text-title-md sm:text-headline-lg-mobile font-extrabold text-primary-container tracking-tight select-none">
            SIZZLE & SNAP
          </span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-lg">
          <Link to="/" className="text-label-md font-bold text-on-surface hover:text-primary-container transition-colors">
            Home
          </Link>
          <Link to="/menu" className="text-label-md font-bold text-on-surface hover:text-primary-container transition-colors">
            Menu
          </Link>
        </nav>

        {/* Right: Cart, Auth, and Hamburger */}
        <div className="flex items-center gap-md">
          {/* Cart Icon trigger */}
          <button 
            onClick={onOpenCart}
            className="relative p-sm text-on-surface hover:text-primary-container hover:bg-surface-container rounded-full transition-all duration-200"
            title="Open Cart"
          >
            <ShoppingBagIcon className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-xs -right-xs bg-primary-container text-on-primary text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* Desktop Auth Links */}
          <div className="hidden md:flex items-center gap-md border-l border-outline-variant/30 pl-md">
            {user ? (
              <div className="flex items-center gap-md">
                <Link 
                  to="/account" 
                  className="text-label-md font-bold text-on-surface hover:text-primary-container transition-colors"
                >
                  Hi, {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-label-sm font-semibold text-on-surface-variant hover:text-error transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-label-md font-bold text-on-surface-variant hover:text-primary-container transition-colors">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-container text-on-primary text-label-sm font-bold px-md py-xs rounded-full hover:bg-primary transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-sm text-on-surface hover:text-primary-container hover:bg-surface-container rounded-full transition-all"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface px-md py-md space-y-md animate-fade-in">
          <div className="flex flex-col gap-sm">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-label-md font-bold text-on-surface p-sm hover:bg-surface-container rounded-lg"
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-label-md font-bold text-on-surface p-sm hover:bg-surface-container rounded-lg"
            >
              Menu
            </Link>
            {user && (
              <Link 
                to="/account" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-label-md font-bold text-on-surface p-sm hover:bg-surface-container rounded-lg border-t border-outline-variant/10 pt-md"
              >
                My Account
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/20 pt-md px-sm">
            {user ? (
              <>
                <span className="text-label-sm font-bold text-on-surface-variant">Logged in as {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-error/10 text-error text-label-sm font-bold px-md py-xs rounded-full hover:bg-error/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="w-full flex gap-md">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center border border-outline text-primary text-label-sm font-bold py-xs rounded-full"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center bg-primary-container text-on-primary text-label-sm font-bold py-xs rounded-full"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
