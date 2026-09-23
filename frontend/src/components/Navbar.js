import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, token, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Name */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl transition-transform group-hover:scale-110 duration-200">🚌</span>
          <span className="text-2xl font-bold tracking-tight text-white">
            Bus<span className="text-amber-300">Ease</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          <Link
            to="/search"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/search') || isActive('/')
                ? 'bg-blue-700 text-white shadow-inner'
                : 'text-blue-100 hover:bg-blue-500 hover:text-white'
            }`}
          >
            🔍 Search Buses
          </Link>

          {token && (
            <Link
              to="/bookings"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/bookings')
                  ? 'bg-blue-700 text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              🎫 My Bookings
            </Link>
          )}

          {token && isAdmin && (
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/admin')
                  ? 'bg-amber-500 text-slate-900 font-semibold'
                  : 'bg-amber-400/20 text-amber-200 hover:bg-amber-400 hover:text-slate-900'
              }`}
            >
              ⚙️ Admin Portal
            </Link>
          )}
        </nav>

        {/* User / Auth Controls */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-blue-700/60 px-3 py-1.5 rounded-full border border-blue-500/50">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                  {user?.name || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors duration-150 flex items-center gap-1"
                title="Sign Out"
              >
                🚪 Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-white hover:text-amber-200 px-3 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 px-3.5 py-1.5 rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
