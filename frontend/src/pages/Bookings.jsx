import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        // Primary Endpoint requested: GET /bookings/{userId}
        let res;
        try {
          res = await API.get(`/bookings/${user.id}`);
        } catch (e) {
          // Fallback to GET /bookings if /bookings/{userId} endpoint returns all/single
          res = await API.get('/bookings');
        }

        let data = res.data;
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }

        // Filter bookings belonging to current user if backend returns full list
        const userBookings = data.filter(
          (b) => !b.user || b.user.id === user.id || b.user === user.id
        );

        setBookings(userBookings.length > 0 ? userBookings : data);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('Could not fetch bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (!user) {
    return <div className="alert alert-error">Please login to view your bookings.</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>My Bookings</h2>

      {loading && <div className="alert alert-info">Loading your bookings...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h3>No Bookings Found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            You have not booked any bus tickets yet.
          </p>
        </div>
      )}

      {!loading &&
        bookings.map((booking) => {
          const schedule = booking.schedule || {};
          const bus = schedule.bus || {};
          const route = schedule.route || {};
          const statusClass =
            booking.status === 'CONFIRMED'
              ? 'badge-success'
              : booking.status === 'CANCELLED'
              ? 'badge-danger'
              : 'badge-warning';

          return (
            <div key={booking.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem' }}>{bus.busName || 'Express Bus'}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Booking ID: #{booking.id} • Seat #{booking.seatNumber}
                  </p>
                </div>
                <span className={`badge ${statusClass}`}>{booking.status || 'CONFIRMED'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Route</div>
                  <div style={{ fontWeight: 600 }}>
                    {route.source || schedule.source || 'N/A'} ➔ {route.destination || schedule.destination || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date & Time</div>
                  <div style={{ fontWeight: 600 }}>
                    {schedule.travelDate || 'N/A'} at {schedule.departureTime || 'N/A'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Paid</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    ₹{booking.totalAmount || schedule.price || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Bookings;
