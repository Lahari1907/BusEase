import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      const user = res.user;
      const destination = location.state?.from?.pathname || (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN' ? '/admin' : '/search');
      navigate(destination, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail('user@busease.com');
    setPassword('password123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@busease.com');
    setPassword('adminpassword');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Card className="max-w-md w-full shadow-lg border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-3xl mb-2">
            🚌
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to BusEase</h2>
          <p className="text-sm text-slate-500">Sign in to search schedules, lock seats, and manage bookings</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3">
            Sign In
          </Button>
        </form>

        {/* Demo Login Shortcuts */}
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-xs space-y-2">
          <span className="font-semibold text-blue-900 block">⚡ Quick Demo Credentials:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoUser}
              className="flex-1 py-1.5 px-2 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 font-medium transition-colors"
            >
              👤 Passenger Demo
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 py-1.5 px-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
            >
              ⚙️ Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 underline">
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
