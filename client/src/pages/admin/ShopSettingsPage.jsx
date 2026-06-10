import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

// Derive display open-state from raw settings (mirrors useShopStatus logic)
function computeIsOpen(settings) {
  if (!settings) return false;
  const { isOpenOverride, openTime, closeTime } = settings;
  if (isOpenOverride !== null && isOpenOverride !== undefined) return isOpenOverride;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return current >= openTime && current <= closeTime;
}

export default function ShopSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Editable time fields
  const [openTime, setOpenTime] = useState('10:00');
  const [closeTime, setCloseTime] = useState('16:00');

  // Save states
  const [savingOverride, setSavingOverride] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null); // 'override' | 'hours' | null
  const [saveError, setSaveError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await api.get('/api/settings');
      const data = res.data.data;
      setSettings(data);
      setOpenTime(data.openTime || '10:00');
      setCloseTime(data.closeTime || '16:00');
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setFetchError('Failed to load shop settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showSuccess = (type) => {
    setSaveSuccess(type);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // ── Override Controls ──────────────────────────────────────────────
  const handleSetOverride = async (value) => {
    if (savingOverride) return;
    setSavingOverride(true);
    setSaveError(null);
    try {
      const res = await api.patch('/api/settings', { isOpenOverride: value });
      setSettings(res.data.data);
      showSuccess('override');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update override.');
    } finally {
      setSavingOverride(false);
    }
  };

  // ── Scheduled Hours ────────────────────────────────────────────────
  const handleSaveHours = async (e) => {
    e.preventDefault();
    setSaveError(null);

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
      setSaveError('Times must be in HH:MM format.');
      return;
    }
    if (openTime >= closeTime) {
      setSaveError('Open time must be earlier than close time.');
      return;
    }

    setSavingHours(true);
    try {
      const res = await api.patch('/api/settings', { openTime, closeTime });
      setSettings(res.data.data);
      showSuccess('hours');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update hours.');
    } finally {
      setSavingHours(false);
    }
  };

  // ── Derived state ──────────────────────────────────────────────────
  const isOpen = settings ? computeIsOpen(settings) : false;
  const override = settings?.isOpenOverride;
  const hasOverride = override !== null && override !== undefined;

  const overrideLabel = hasOverride
    ? (override ? 'Force OPEN' : 'Force CLOSED')
    : 'Scheduled Hours';

  const inputClass = 'bg-surface-container-high border border-outline-variant/40 rounded-lg px-md py-sm text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all w-full';
  const labelClass = 'block text-label-sm font-bold text-on-surface-variant mb-xs';

  return (
    <div className="max-w-2xl mx-auto space-y-xl">

      {/* Page header */}
      <div className="border-b border-outline-variant/20 pb-md">
        <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
          Shop Settings
        </h1>
        <p className="text-body-md text-on-surface-variant mt-xs">
          Control when the shop accepts orders and manage operating hours
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-md">
          {[1, 2].map((n) => (
            <div key={n} className="bg-surface-lowest border border-outline-variant/20 rounded-xl p-lg animate-pulse">
              <div className="h-4 bg-surface-container rounded w-1/4 mb-md" />
              <div className="h-24 bg-surface-container rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <div className="bg-error-container/30 border border-error/20 rounded-xl p-lg flex flex-col items-center gap-md text-center">
          <ExclamationTriangleIcon className="h-10 w-10 text-error" />
          <p className="text-body-md text-on-surface-variant">{fetchError}</p>
          <button onClick={fetchSettings} className="inline-flex items-center gap-xs text-label-md font-bold px-lg py-sm bg-primary-container text-on-primary rounded-full hover:bg-primary transition-all">
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {settings && !loading && (
        <>
          {/* Global success / error banner */}
          {saveSuccess && (
            <div className="flex items-center gap-sm bg-[#c8f0d2] border border-[#1a6b2a]/20 rounded-xl px-lg py-md">
              <CheckCircleIcon className="h-5 w-5 text-[#1a6b2a] shrink-0" />
              <p className="text-label-md font-bold text-[#0d3d18]">
                {saveSuccess === 'override' ? 'Override setting saved.' : 'Operating hours saved.'}
              </p>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-sm bg-error-container/30 border border-error/20 rounded-xl px-lg py-md">
              <ExclamationTriangleIcon className="h-5 w-5 text-error shrink-0" />
              <p className="text-label-md font-bold text-on-error-container">{saveError}</p>
            </div>
          )}

          {/* ── Live Status Card ──────────────────────────────────── */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-lg shadow-card">
            <div className="flex items-start justify-between gap-md">
              <div>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-xs">
                  Current Shop Status
                </p>
                <div className="flex items-center gap-sm mt-xs">
                  <span className={`relative flex h-3 w-3`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${isOpen ? 'bg-[#1a6b2a]' : 'bg-error'}`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isOpen ? 'bg-[#1a6b2a]' : 'bg-error'}`} />
                  </span>
                  <span className={`text-headline-lg-mobile font-extrabold ${isOpen ? 'text-[#1a6b2a]' : 'text-error'}`}>
                    {isOpen ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <p className="text-label-sm text-on-surface-variant mt-xs">
                  Mode: <span className="font-bold text-on-surface">{overrideLabel}</span>
                </p>
              </div>
              <div className={`px-md py-xs rounded-full text-label-sm font-bold ${
                hasOverride
                  ? 'bg-[#fff3cd] text-[#7a5900] border border-[#ffd666]/40'
                  : 'bg-surface-container text-on-surface-variant border border-outline-variant/30'
              }`}>
                {hasOverride ? '⚡ Override Active' : '🕐 On Schedule'}
              </div>
            </div>
          </div>

          {/* ── Override Controls ─────────────────────────────────── */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-lg shadow-card space-y-md">
            <div className="flex items-center gap-sm">
              <div className="h-9 w-9 bg-[#fff3cd] rounded-lg flex items-center justify-center shrink-0">
                <BoltIcon className="h-5 w-5 text-[#7a5900]" />
              </div>
              <div>
                <h2 className="text-title-md font-bold text-on-surface">Override Control</h2>
                <p className="text-label-sm text-on-surface-variant">
                  Force the shop open or closed, ignoring the schedule below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-sm">
              {/* Force Open */}
              <button
                onClick={() => handleSetOverride(true)}
                disabled={savingOverride}
                className={`flex flex-col items-center justify-center gap-xs py-lg rounded-xl border-2 transition-all text-label-md font-bold active:scale-[0.97] ${
                  hasOverride && override === true
                    ? 'bg-[#c8f0d2] border-[#1a6b2a] text-[#0d3d18] shadow-sm'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-[#1a6b2a]/40 hover:bg-[#f0fff4]'
                }`}
              >
                <span className="text-2xl">✅</span>
                Force Open
              </button>

              {/* Use Schedule */}
              <button
                onClick={() => handleSetOverride(null)}
                disabled={savingOverride}
                className={`flex flex-col items-center justify-center gap-xs py-lg rounded-xl border-2 transition-all text-label-md font-bold active:scale-[0.97] ${
                  !hasOverride
                    ? 'bg-surface-container border-secondary-container text-on-surface shadow-sm'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-secondary-container/40 hover:bg-surface-container-low'
                }`}
              >
                <span className="text-2xl">🕐</span>
                Use Schedule
              </button>

              {/* Force Closed */}
              <button
                onClick={() => handleSetOverride(false)}
                disabled={savingOverride}
                className={`flex flex-col items-center justify-center gap-xs py-lg rounded-xl border-2 transition-all text-label-md font-bold active:scale-[0.97] ${
                  hasOverride && override === false
                    ? 'bg-error-container/40 border-error text-on-error-container shadow-sm'
                    : 'border-outline-variant/30 text-on-surface-variant hover:border-error/40 hover:bg-error-container/10'
                }`}
              >
                <span className="text-2xl">🔴</span>
                Force Closed
              </button>
            </div>

            {savingOverride && (
              <p className="text-label-sm text-on-surface-variant/60 flex items-center gap-xs">
                <ArrowPathIcon className="h-3 w-3 animate-spin" />
                Saving override…
              </p>
            )}
          </div>

          {/* ── Scheduled Hours ───────────────────────────────────── */}
          <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-lg shadow-card">
            <div className="flex items-center gap-sm mb-lg">
              <div className="h-9 w-9 bg-surface-container-high rounded-lg flex items-center justify-center shrink-0">
                <ClockIcon className="h-5 w-5 text-on-surface-variant" />
              </div>
              <div>
                <h2 className="text-title-md font-bold text-on-surface">Scheduled Hours</h2>
                <p className="text-label-sm text-on-surface-variant">
                  When no override is active, orders are accepted during these hours
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveHours} className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className={labelClass}>Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    disabled={savingHours}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    disabled={savingHours}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Preview row */}
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-md py-sm flex items-center gap-sm">
                <ClockIcon className="h-4 w-4 text-on-surface-variant/60 shrink-0" />
                <p className="text-label-sm text-on-surface-variant">
                  Shop will be open{' '}
                  <span className="font-bold text-on-surface">
                    {openTime} – {closeTime}
                  </span>{' '}
                  based on local server time
                </p>
              </div>

              <div className="flex justify-end pt-xs">
                <button
                  type="submit"
                  disabled={savingHours}
                  className={`inline-flex items-center gap-xs px-xl py-sm text-label-md font-bold rounded-full shadow-sm transition-all active:scale-[0.98] ${
                    savingHours
                      ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed shadow-none'
                      : 'bg-primary-container text-on-primary hover:bg-primary hover:shadow-hover'
                  }`}
                >
                  {savingHours && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  {savingHours ? 'Saving...' : 'Save Hours'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Info box ─────────────────────────────────────────── */}
          <div className="flex items-start gap-sm bg-surface-container-low border border-outline-variant/20 rounded-xl p-md">
            <ShieldCheckIcon className="h-5 w-5 text-on-surface-variant/50 shrink-0 mt-xs" />
            <p className="text-label-sm text-on-surface-variant/70">
              Customers see the shop as <strong>open or closed</strong> based on these settings. 
              When closed, the checkout is disabled and customers are shown a "We're closed" notice. 
              Override takes precedence over scheduled hours at all times.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
