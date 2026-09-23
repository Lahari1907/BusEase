import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Reusable Components
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Pages
import Search from './pages/Search';
import Login from './pages/Login';
import Seats from './pages/Seats';
import Payment from './pages/Payment';
import Bookings from './pages/Bookings';

const App = () => {
  const { toastMessage, hideToast } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {/* Centralized Clean Header Navbar */}
      <Navbar />

      {/* Main Page Body */}
      <main className="flex-1">
        <Routes>
          {/* Main Target Routes */}
          <Route path="/" element={<Search />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/seats" element={<Seats />} />
          <Route path="/seats/:scheduleId" element={<Seats />} />
          <Route path="/seat-selection/:scheduleId" element={<Seats />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/bookings" element={<Bookings />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Toast Component */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default App;
