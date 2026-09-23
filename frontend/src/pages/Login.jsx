import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">🚌</div>
          <h2>Welcome to BusEase</h2>
          <p>Sign in to access schedules, lock seats, and manage bookings</p>
        </div>

        {errorMsg && <div className="auth-error-alert">⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <span className="btn-spinner"></span> : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="demo-credentials-box">
          <span className="demo-label">⚡ Fast Demo Logins:</span>
          <div className="demo-buttons">
            <button type="button" className="btn-demo-chip" onClick={fillDemoUser}>
              👤 Fill User Demo
            </button>
            <button type="button" className="btn-demo-chip admin" onClick={fillDemoAdmin}>
              ⚙️ Fill Admin Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have a BusEase account?{' '}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
