import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

export default function LoginPage() {
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
      login(token, user);

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/orders');
      } else {
        navigate('/menu');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-md py-3xl">
      <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card">
        <div className="text-center mb-xl">
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Welcome Back
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Log in to your Sizzle & Snap account
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
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-xl border-t border-outline-variant/20 pt-md text-body-md text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:text-primary-container transition-colors">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
