import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      const user = res.user;
      if (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/search', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try a different email address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">🎫</div>
          <h2>Create BusEase Account</h2>
          <p>Join millions of travelers booking tickets seamlessly</p>
        </div>

        {errorMsg && <div className="auth-error-alert">⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
            <label htmlFor="password">Password (Min 6 characters)</label>
            <input
              id="password"
              type="password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <div className="role-selector-group">
              <label className={`role-radio-btn ${role === 'ROLE_USER' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="ROLE_USER"
                  checked={role === 'ROLE_USER'}
                  onChange={() => setRole('ROLE_USER')}
                />
                👤 Passenger
              </label>

              <label className={`role-radio-btn ${role === 'ROLE_ADMIN' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="ROLE_ADMIN"
                  checked={role === 'ROLE_ADMIN'}
                  onChange={() => setRole('ROLE_ADMIN')}
                />
                ⚙️ Admin
              </label>
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <span className="btn-spinner"></span> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
