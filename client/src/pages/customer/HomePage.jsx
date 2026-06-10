import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import StatusBanner from '../../components/customer/StatusBanner';
import MenuCard from '../../components/customer/MenuCard';
import useShopStatus from '../../hooks/useShopStatus';
import { CATEGORIES } from '../../constants';
import { ArrowRightIcon, ClockIcon, MapPinIcon, TagIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const [previewItems, setPreviewItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const { isOpen } = useShopStatus();

  useEffect(() => {
    const fetchPreview = async () => {
      setLoadingItems(true);
      try {
        const res = await api.get('/api/menu');
        const allItems = res.data.data || [];

        // Pick the first available item from each category (or any item if none available)
        const picks = CATEGORIES.map((cat) => {
          const catItems = allItems.filter((i) => i.category === cat);
          return catItems.find((i) => i.isAvailable) || catItems[0] || null;
        }).filter(Boolean);

        setPreviewItems(picks);
      } catch (err) {
        console.error('HomePage preview fetch error:', err);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchPreview();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background dark:bg-[#0d0c0c] transition-colors duration-300">
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-container/10 dark:bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-secondary-container/10 dark:bg-secondary-container/25 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <StatusBanner />

        <div className="relative max-w-7xl mx-auto px-md sm:px-lg py-3xl sm:py-[80px] text-center">
          {/* Eyebrow tag */}
          <span className="inline-flex items-center gap-xs bg-primary-fixed/20 dark:bg-primary-fixed/5 text-primary-container dark:text-primary text-label-sm font-extrabold px-md py-xs rounded-full mb-lg uppercase tracking-widest border border-primary-container/20 dark:border-zinc-850">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-container dark:bg-primary animate-pulse" />
            Fast Food · Pick-Up Only
          </span>

          {/* Headline */}
          <h1 className="text-display-lg-mobile sm:text-display-lg font-extrabold text-on-background dark:text-zinc-100 tracking-tighter leading-tight mb-md">
            Sizzle &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-secondary-container">
              Snap
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-body-lg sm:text-headline-lg-mobile text-on-surface-variant dark:text-zinc-400 max-w-xl mx-auto mb-xl leading-relaxed">
            Fresh-made burgers, crispy fries, and ice-cold drinks — ready for pick-up in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
            <Link
              to="/menu"
              className="inline-flex items-center gap-sm bg-primary-container text-on-primary font-bold text-label-lg px-xl py-md rounded-full hover:bg-primary dark:bg-primary dark:hover:bg-primary-container shadow-card hover:shadow-hover transition-all active:scale-[0.97]"
            >
              View Full Menu
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-sm text-label-lg font-bold text-on-surface-variant dark:text-zinc-300 border border-outline-variant/40 dark:border-zinc-800/80 px-xl py-md rounded-full hover:bg-surface-container dark:hover:bg-zinc-900 transition-all"
            >
              <TagIcon className="h-5 w-5" />
              Sign up for 5% off
            </Link>
          </div>
        </div>
      </section>

      {/* ── Category Preview Section ───────────────────────────────── */}
      <section className="py-3xl bg-surface-low dark:bg-zinc-950 flex-1 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-md sm:px-lg">
          <div className="flex items-end justify-between mb-xl">
            <div>
              <p className="text-label-sm font-bold text-primary-container uppercase tracking-widest mb-xs">
                Our Menu
              </p>
              <h2 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background dark:text-zinc-100 tracking-tight">
                Something for everyone
              </h2>
            </div>
            <Link
              to="/menu"
              className="hidden sm:inline-flex items-center gap-xs text-label-md font-bold text-primary-container dark:text-primary hover:underline underline-offset-4"
            >
              See all items
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Loading skeletons */}
          {loadingItems && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-surface-lowest dark:bg-zinc-900 rounded-xl overflow-hidden shadow-card animate-pulse">
                  <div className="h-[200px] bg-surface-container dark:bg-zinc-800" />
                  <div className="p-md space-y-sm">
                    <div className="h-3 bg-surface-container dark:bg-zinc-800/80 rounded w-1/4" />
                    <div className="h-5 bg-surface-container dark:bg-zinc-800/80 rounded w-3/4" />
                    <div className="h-3 bg-surface-container dark:bg-zinc-800/80 rounded w-full" />
                    <div className="h-10 bg-surface-container dark:bg-zinc-800/80 rounded-full mt-md" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cards grid */}
          {!loadingItems && previewItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
              {previewItems.map((item) => (
                <MenuCard key={item.id} item={item} shopOpen={isOpen} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingItems && previewItems.length === 0 && (
            <div className="text-center py-3xl text-on-surface-variant/50 dark:text-zinc-500">
              <p className="text-headline-lg-mobile font-bold">Menu coming soon!</p>
              <p className="text-body-md mt-xs">Check back in a moment.</p>
            </div>
          )}

          {/* Mobile "see all" CTA */}
          <div className="mt-xl text-center sm:hidden">
            <Link
              to="/menu"
              className="inline-flex items-center gap-sm text-label-md font-bold text-primary-container border border-primary-container/30 px-xl py-sm rounded-full hover:bg-primary-fixed/10 transition-all"
            >
              Browse the full menu
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="bg-surface-lowest dark:bg-zinc-900 border-t border-outline-variant/20 dark:border-zinc-850 py-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-md sm:px-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-lg">
            {/* Brand */}
            <div>
              <p className="text-title-md font-extrabold text-primary-container dark:text-primary tracking-tight">
                SIZZLE &amp; SNAP
              </p>
              <p className="text-label-sm text-on-surface-variant dark:text-zinc-400 mt-xs">
                Fast food done right.
              </p>
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap items-center justify-center gap-md text-label-sm font-semibold text-on-surface-variant dark:text-zinc-300">
              <span className="flex items-center gap-xs">
                <ClockIcon className="h-4 w-4 text-primary-container dark:text-primary" />
                Open 10:00 AM – 4:00 PM
              </span>
              <span className="h-1 w-1 rounded-full bg-outline-variant/40 dark:bg-zinc-800 hidden sm:block" />
              <span className="flex items-center gap-xs">
                <MapPinIcon className="h-4 w-4 text-primary-container dark:text-primary" />
                Pick-up only
              </span>
              <span className="h-1 w-1 rounded-full bg-outline-variant/40 dark:bg-zinc-800 hidden sm:block" />
              <span className="flex items-center gap-xs">
                <TagIcon className="h-4 w-4 text-primary-container dark:text-primary" />
                5% off for registered members
              </span>
            </div>
          </div>

          <div className="mt-lg pt-md border-t border-outline-variant/10 dark:border-zinc-850/40 text-center">
            <p className="text-label-sm text-on-surface-variant/50 dark:text-zinc-500">
              © {new Date().getFullYear()} Sizzle &amp; Snap. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
