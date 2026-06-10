import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminLoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/auth/login', {
        email: email.trim(),
        password
      });

      const { token, user } = res.data.data;

      // Verify that this is an admin user
      if (user.role !== 'admin') {
        setError('Access denied — not an admin account.');
        setLoading(false);
        return;
      }

      login(token, user);
      navigate('/admin/orders');
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-md py-3xl">
      <div className="max-w-md w-full bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card">
        <div className="text-center mb-xl">
          <div className="inline-block bg-primary-container/10 border border-primary/20 rounded-full px-md py-xs mb-sm">
            <span className="text-primary text-label-sm font-extrabold uppercase tracking-widest">
              Admin Portal
            </span>
          </div>
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Control Center
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Log in to manage orders, menu, and settings
          </p>
        </div>

        {error && (
          <div className="bg-error-container/40 border border-error/20 p-md rounded-lg text-on-error-container text-label-md font-bold mb-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="block text-label-sm font-bold text-on-surface-variant mb-sm">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="admin@sizzlesnap.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-label-sm font-bold text-on-surface-variant mb-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary-container text-on-primary text-label-md font-bold py-md rounded-full shadow-md transition-all active:scale-[0.98] mt-lg ${
              loading
                ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed shadow-none'
                : 'hover:bg-primary hover:shadow-hover'
            }`}
          >
            {loading ? 'Verifying Admin...' : 'Log In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
