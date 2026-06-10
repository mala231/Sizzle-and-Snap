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

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-navbar shadow-none">
      <div className="max-w-7xl mx-auto px-md sm:px-lg h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-xs">
          <span className="text-title-md sm:text-headline-lg-mobile font-extrabold text-primary-container tracking-tight select-none">
            SIZZLE & SNAP
          </span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-lg">
          <Link to="/" className="text-label-md font-bold text-on-surface dark:text-zinc-200 hover:text-primary-container dark:hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/menu" className="text-label-md font-bold text-on-surface dark:text-zinc-200 hover:text-primary-container dark:hover:text-primary transition-colors">
            Menu
          </Link>
        </nav>

        {/* Right: Cart, Auth, and Hamburger */}
        <div className="flex items-center gap-md">
          {/* Theme Toggler */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-sm text-on-surface dark:text-zinc-300 hover:text-primary-container dark:hover:text-primary hover:bg-surface-container dark:hover:bg-zinc-800 rounded-full transition-all duration-200"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Cart Icon trigger */}
          <button 
            onClick={onOpenCart}
            className="relative p-sm text-on-surface dark:text-zinc-200 hover:text-primary-container dark:hover:text-primary hover:bg-surface-container dark:hover:bg-zinc-800 rounded-full transition-all duration-200"
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
          <div className="hidden md:flex items-center gap-md border-l border-outline-variant/30 dark:border-zinc-800/40 pl-md">
            {user ? (
              <div className="flex items-center gap-md">
                <Link 
                  to="/account" 
                  className="text-label-md font-bold text-on-surface dark:text-zinc-200 hover:text-primary-container dark:hover:text-primary transition-colors"
                >
                  Hi, {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-label-sm font-semibold text-on-surface-variant dark:text-zinc-400 hover:text-error dark:hover:text-error transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-label-md font-bold text-on-surface-variant dark:text-zinc-400 hover:text-primary-container dark:hover:text-primary transition-colors">
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
            className="md:hidden p-sm text-on-surface dark:text-zinc-200 hover:text-primary-container dark:hover:text-primary hover:bg-surface-container dark:hover:bg-zinc-800 rounded-full transition-all"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 dark:border-zinc-800/40 bg-surface dark:bg-zinc-900 px-md py-md space-y-md animate-fade-in">
          <div className="flex flex-col gap-sm">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-label-md font-bold text-on-surface dark:text-zinc-200 p-sm hover:bg-surface-container dark:hover:bg-zinc-800 rounded-lg"
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-label-md font-bold text-on-surface dark:text-zinc-200 p-sm hover:bg-surface-container dark:hover:bg-zinc-800 rounded-lg"
            >
              Menu
            </Link>
            {user && (
              <Link 
                to="/account" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-label-md font-bold text-on-surface dark:text-zinc-200 p-sm hover:bg-surface-container dark:hover:bg-zinc-800 rounded-lg border-t border-outline-variant/10 dark:border-zinc-800/20 pt-md"
              >
                My Account
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-outline-variant/20 dark:border-zinc-800/40 pt-md px-sm">
            {user ? (
              <>
                <span className="text-label-sm font-bold text-on-surface-variant dark:text-zinc-400">Logged in as {user.name}</span>
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
                  className="flex-1 text-center border border-outline dark:border-zinc-700 text-primary dark:text-zinc-200 text-label-sm font-bold py-xs rounded-full"
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
