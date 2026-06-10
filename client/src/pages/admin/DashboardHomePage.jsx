import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import {
  ClipboardDocumentListIcon,
  Squares2X2Icon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  BoltIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Derives the computed open state from raw settings
function computeIsOpen(settings) {
  if (!settings) return false;
  const { isOpenOverride, openTime, closeTime } = settings;
  if (isOpenOverride !== null && isOpenOverride !== undefined) return isOpenOverride;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return current >= openTime && current <= closeTime;
}

function StatCard({ icon: Icon, label, value, sub, colorClass, loading, href }) {
  const inner = (
    <div className={`bg-surface-lowest border border-outline-variant/30 rounded-xl p-lg shadow-card flex flex-col gap-md hover:shadow-hover transition-all group ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <ArrowRightIcon className="h-4 w-4 text-on-surface-variant/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
      {loading ? (
        <div className="space-y-xs">
          <div className="h-8 bg-surface-container rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-surface-container rounded w-2/3 animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-headline-lg font-extrabold text-on-surface tracking-tight">{value}</p>
          <div>
            <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
            {sub && <p className="text-label-sm text-on-surface-variant/60 mt-xs">{sub}</p>}
          </div>
        </>
      )}
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

function RecentOrderRow({ order }) {
  const statusColors = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', pip: 'bg-amber-400' },
    ready:   { bg: 'bg-blue-100',  text: 'text-blue-800',  pip: 'bg-blue-500' },
    completed:{ bg: 'bg-[#c8f0d2]', text: 'text-[#0d3d18]', pip: 'bg-[#1a6b2a]' }
  };
  const s = statusColors[order.status] || statusColors.pending;
  const totalItems = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const total = order.items?.reduce((sum, i) => sum + parseFloat(i.unitPrice) * i.quantity, 0) ?? 0;

  return (
    <div className="flex items-center justify-between py-sm px-md hover:bg-surface-container-low rounded-lg transition-colors">
      <div className="flex items-center gap-md min-w-0">
        <span className="text-label-sm font-bold text-on-surface-variant/50 w-8 shrink-0">
          #{order.id}
        </span>
        <div className="min-w-0">
          <p className="text-body-md font-bold text-on-surface truncate">
            {order.pickupName}
          </p>
          <p className="text-label-sm text-on-surface-variant/60">
            {totalItems} item{totalItems !== 1 ? 's' : ''} · ${total.toFixed(2)}
          </p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-xs px-md py-xs rounded-full text-label-sm font-bold shrink-0 ${s.bg} ${s.text}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${s.pip}`} />
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>
    </div>
  );
}

export default function DashboardHomePage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [shopSettings, setShopSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, menuRes, settingsRes] = await Promise.all([
          api.get('/api/orders'),
          api.get('/api/menu'),
          api.get('/api/settings')
        ]);
        setOrders(ordersRes.data.data || []);
        setMenuItems(menuRes.data.data || []);
        setShopSettings(settingsRes.data.data || null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Derived stats ──────────────────────────────────────────
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + parseFloat(i.unitPrice) * i.quantity, 0) ?? 0), 0);
  const soldOutItems = menuItems.filter((i) => !i.isAvailable).length;
  const isShopOpen = computeIsOpen(shopSettings);
  const override = shopSettings?.isOpenOverride;
  const hasOverride = override !== null && override !== undefined;
  const recentOrders = [...orders].reverse().slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-xl">

      {/* Page header */}
      <div className="border-b border-outline-variant/20 pb-md">
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
          Dashboard
        </h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Live snapshot of your shop's performance
        </p>
      </div>

      {/* Error */}
      {!loading && error && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-lg flex items-center gap-sm">
          <ExclamationTriangleIcon className="h-6 w-6 text-error shrink-0" />
          <p className="text-body-md text-on-surface-variant">{error}</p>
        </div>
      )}

      {/* ── Shop Status Banner ───────────────────────────────── */}
      <div className={`rounded-xl p-md flex flex-col sm:flex-row sm:items-center justify-between gap-md border ${
        isShopOpen
          ? 'bg-[#f0fff4] border-[#1a6b2a]/20'
          : 'bg-error-container/20 border-error/15'
      }`}>
        <div className="flex items-center gap-md">
          <span className="relative flex h-4 w-4">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isShopOpen ? 'bg-[#1a6b2a]' : 'bg-error'}`} />
            <span className={`relative inline-flex rounded-full h-4 w-4 ${isShopOpen ? 'bg-[#1a6b2a]' : 'bg-error'}`} />
          </span>
          <div>
            <p className={`text-title-sm font-extrabold ${isShopOpen ? 'text-[#0d3d18]' : 'text-on-error-container'}`}>
              Shop is currently {isShopOpen ? 'OPEN' : 'CLOSED'}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-xs">
              {hasOverride
                ? `Override active — ${override ? 'forced open' : 'forced closed'}`
                : `On schedule · ${shopSettings?.openTime ?? '—'} – ${shopSettings?.closeTime ?? '—'}`}
            </p>
          </div>
        </div>
        <Link
          to="/admin/settings"
          className="inline-flex items-center gap-xs text-label-md font-bold text-on-surface-variant border border-outline-variant/30 rounded-full px-md py-xs hover:bg-surface-container transition-all shrink-0"
        >
          <BoltIcon className="h-4 w-4" />
          Change Override
        </Link>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Orders"
          value={loading ? '—' : totalOrders}
          sub="All time"
          colorClass="bg-surface-container-high text-on-surface-variant"
          loading={loading}
          href="/admin/orders"
        />
        <StatCard
          icon={ClockIcon}
          label="Pending"
          value={loading ? '—' : pendingOrders}
          sub="Awaiting action"
          colorClass="bg-amber-100 text-amber-700"
          loading={loading}
          href="/admin/orders"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={loading ? '—' : completedOrders}
          sub="Fulfilled orders"
          colorClass="bg-[#c8f0d2] text-[#0d3d18]"
          loading={loading}
          href="/admin/orders"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Revenue"
          value={loading ? '—' : `$${totalRevenue.toFixed(2)}`}
          sub="From completed orders"
          colorClass="bg-primary-fixed/30 text-primary-container"
          loading={loading}
        />
      </div>

      {/* ── Bottom row: Recent Orders + Quick Links ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">

        {/* Recent Orders — spans 2 cols */}
        <div className="lg:col-span-2 bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/15">
            <h2 className="text-title-sm font-bold text-on-surface">Recent Orders</h2>
            <Link to="/admin/orders" className="text-label-sm font-bold text-primary-container hover:underline flex items-center gap-xs">
              View all <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-md space-y-sm">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 bg-surface-container rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-xl text-center text-on-surface-variant/50">
              <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-sm opacity-30" />
              <p className="text-label-md">No orders yet</p>
            </div>
          ) : (
            <div className="p-sm">
              {recentOrders.map((order) => (
                <RecentOrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links + Alerts panel */}
        <div className="flex flex-col gap-md">

          {/* Quick Nav */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-card p-lg space-y-sm">
            <h2 className="text-title-sm font-bold text-on-surface mb-md">Quick Links</h2>
            {[
              { label: 'View Orders', icon: ClipboardDocumentListIcon, to: '/admin/orders' },
              { label: 'Manage Menu', icon: Squares2X2Icon, to: '/admin/menu' },
              { label: 'Shop Settings', icon: BoltIcon, to: '/admin/settings' }
            ].map(({ label, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-md p-md rounded-xl text-body-md font-bold text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
                <ArrowRightIcon className="h-4 w-4 ml-auto opacity-30 group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          {/* Alerts */}
          {!loading && (pendingOrders > 0 || soldOutItems > 0) && (
            <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-card p-lg space-y-sm">
              <h2 className="text-title-sm font-bold text-on-surface mb-md">Alerts</h2>
              {pendingOrders > 0 && (
                <div className="flex items-start gap-sm p-sm rounded-lg bg-amber-50 border border-amber-200/60">
                  <ClockIcon className="h-4 w-4 text-amber-600 shrink-0 mt-xs" />
                  <p className="text-label-sm font-bold text-amber-800">
                    {pendingOrders} order{pendingOrders !== 1 ? 's' : ''} awaiting action
                  </p>
                </div>
              )}
              {soldOutItems > 0 && (
                <div className="flex items-start gap-sm p-sm rounded-lg bg-error-container/20 border border-error/15">
                  <ShieldExclamationIcon className="h-4 w-4 text-error shrink-0 mt-xs" />
                  <p className="text-label-sm font-bold text-on-error-container">
                    {soldOutItems} item{soldOutItems !== 1 ? 's' : ''} marked as sold out
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
