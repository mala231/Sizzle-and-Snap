import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

export default function RegisterPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password
      });

      const { token, user } = res.data.data;
      login(token, user);
      navigate('/menu');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Failed to register. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-md py-2xl">
      <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card">
        <div className="text-center mb-xl">
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Create Account
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Join Sizzle & Snap to save 5% on all pickup orders
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
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all"
              required
            />
          </div>

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
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-label-sm font-bold text-on-surface-variant mb-sm">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-xl border-t border-outline-variant/20 pt-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:text-primary-container transition-colors">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
