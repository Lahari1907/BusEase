import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatCurrency, formatDate } from '../utils/helpers';

const Bookings = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const userId = user?.id || 1;
      const data = await getUserBookings(userId);
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await cancelBooking(bookingId);
      showToast(res.message || `Booking ${bookingId} cancelled successfully.`, 'success');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId || b.bookingId === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">🎫 My Booking History</h2>
        <p className="text-xs text-slate-500">Manage your active reservations, view e-tickets, or process cancellations</p>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: `All Trips (${bookings.length})` },
          { id: 'CONFIRMED', label: `Active (${bookings.filter(b => b.status === 'CONFIRMED').length})` },
          { id: 'COMPLETED', label: `Completed (${bookings.filter(b => b.status === 'COMPLETED').length})` },
          { id: 'CANCELLED', label: `Cancelled (${bookings.filter(b => b.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List Area */}
      {loading ? (
        <Loader label="Loading booking history..." />
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const bookingRef = b.bookingId || b.id;
            const isConfirmed = b.status === 'CONFIRMED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <Card key={bookingRef} className="p-6 space-y-4 hover:border-blue-200 transition-all">
                
                {/* Card Header: PNR & Status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PNR:</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">{bookingRef}</span>
                  </div>

                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {b.status === 'CONFIRMED' ? '✅ CONFIRMED' : b.status === 'CANCELLED' ? '❌ CANCELLED' : '🏁 COMPLETED'}
                  </span>
                </div>

                {/* Card Body: Route, Dates, Seats & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  
                  {/* Route */}
                  <div className="space-y-1 sm:col-span-1">
                    <span className="text-slate-400 font-medium block">Route & Bus</span>
                    <span className="font-bold text-slate-900 text-sm block">
                      {b.source} ➔ {b.destination}
                    </span>
                    <span className="text-slate-500 block">{b.busName} ({b.busNumber})</span>
                  </div>

                  {/* Travel Date */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">Date & Time</span>
                    <span className="font-bold text-slate-800 block">{formatDate(b.departureDate)}</span>
                    <span className="text-slate-500 block">{b.departureTime}</span>
                  </div>

                  {/* Seats */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">Reserved Seats</span>
                    <span className="font-bold text-slate-800 block">
                      {Array.isArray(b.seatNumbers) ? b.seatNumbers.map(s => `Seat #${s}`).join(', ') : `Seat #${b.seatNumbers}`}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <span className="text-slate-400 font-medium block">Total Paid</span>
                    <span className="font-extrabold text-blue-600 text-base block">{formatCurrency(b.totalFare)}</span>
                  </div>
                </div>

                {/* Card Footer: Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 text-xs gap-3">
                  <span className="text-slate-400">Booked on {b.bookedAt || 'Recent'}</span>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {isConfirmed && (
                      <Button
                        onClick={() => handleCancelBooking(bookingRef)}
                        isLoading={cancellingId === bookingRef}
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 flex-1 sm:flex-initial"
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {!isCancelled && (
                      <Button
                        onClick={() => showToast(`E-Ticket PNR ${bookingRef} downloaded!`, 'success')}
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-initial"
                      >
                        🎫 View E-Ticket
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12 space-y-4">
          <div className="text-4xl">🎫</div>
          <h3 className="text-lg font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't booked any bus tickets in this category yet.
          </p>
          <Button onClick={() => navigate('/search')} variant="primary" size="sm">
            🔍 Book a Bus Ticket Now
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Bookings;
