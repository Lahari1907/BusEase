import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import SkeletonLoader from '../components/SkeletonLoader';

const Ticket = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingTicket = async () => {
      setLoading(true);
      try {
        const data = await bookingApi.getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error('Error loading ticket details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingTicket();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="ticket-page-container">
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="ticket-page-container text-center">
        <h2>Ticket Not Found</h2>
        <p>The requested booking reference could not be retrieved.</p>
        <Link to="/bookings" className="btn-primary">View My Bookings</Link>
      </div>
    );
  }

  const {
    id,
    passengerName,
    passengerAge,
    passengerGender,
    passengerPhone,
    busName,
    busNumber,
    source,
    destination,
    departureDate,
    departureTime,
    arrivalTime,
    seatNumbers = [],
    totalFare,
    status = 'CONFIRMED',
    transactionId,
    bookedAt
  } = booking;

  return (
    <div className="ticket-page-container">
      {/* Top Bar Action Commands */}
      <div className="ticket-action-bar no-print">
        <button className="btn-back-home" onClick={() => navigate('/')}>
          🏠 Back to Home
        </button>
        <div className="right-actions">
          <Link to="/bookings" className="btn-history-link">
            📋 My Booking History
          </Link>
          <button className="btn-print-ticket" onClick={handlePrint}>
            🖨️ Print Ticket / Save PDF
          </button>
        </div>
      </div>

      {/* Main Printable Ticket Card */}
      <div className="printable-ticket-card" id="printable-ticket">
        {/* Ticket Top Header */}
        <div className="ticket-brand-header">
          <div className="brand-logo-area">
            <span className="ticket-logo-icon">🚌</span>
            <div className="ticket-brand-name">
              <span>BusEase</span>
              <span className="e-ticket-sub">OFFICIAL E-TICKET & BOARDING PASS</span>
            </div>
          </div>
          <div className="ticket-status-badge confirmed">
            <span className="status-dot"></span>
            <span>{status.toUpperCase()}</span>
          </div>
        </div>

        {/* PNR & Transaction Meta Banner */}
        <div className="ticket-meta-banner">
          <div className="meta-item">
            <span className="meta-label">PNR / BOOKING ID</span>
            <span className="meta-val pnr-code">{id || bookingId}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">TRANSACTION ID</span>
            <span className="meta-val">{transactionId || 'TXN-98421098'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">BOOKED ON</span>
            <span className="meta-val">{bookedAt || '2026-09-14'}</span>
          </div>
        </div>

        {/* Bus & Journey Timeline Section */}
        <div className="ticket-body-grid">
          <div className="ticket-section bus-details-section">
            <h3>🚌 Operator & Fleet Info</h3>
            <div className="info-pair">
              <span className="label">Bus Service:</span>
              <span className="val bold">{busName || 'InterCity Express'}</span>
            </div>
            <div className="info-pair">
              <span className="label">Bus Registration:</span>
              <span className="val">{busNumber || 'MH-12-AB-1234'}</span>
            </div>
            <div className="info-pair">
              <span className="label">Travel Date:</span>
              <span className="val highlight-date">{departureDate || '2026-09-15'}</span>
            </div>
          </div>

          <div className="ticket-section route-journey-section">
            <h3>📍 Route & Schedule Timeline</h3>
            <div className="ticket-timeline">
              <div className="timeline-node">
                <span className="t-time">{departureTime || '06:00 AM'}</span>
                <span className="t-city">{source || 'Origin'}</span>
                <span className="t-point">Main Bus Terminal</span>
              </div>
              <div className="timeline-arrow-line">
                <span className="arrow-head">➔</span>
              </div>
              <div className="timeline-node">
                <span className="t-time">{arrivalTime || '09:30 AM'}</span>
                <span className="t-city">{destination || 'Destination'}</span>
                <span className="t-point">Central Bus Stand</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="ticket-cut-line" />

        {/* Passenger & Seat Numbers Details */}
        <div className="ticket-body-grid">
          <div className="ticket-section passenger-info-section">
            <h3>👤 Passenger Details</h3>
            <div className="info-pair">
              <span className="label">Passenger Name:</span>
              <span className="val bold">{passengerName}</span>
            </div>
            <div className="info-pair">
              <span className="label">Age & Gender:</span>
              <span className="val">{passengerAge} Yrs | {passengerGender}</span>
            </div>
            <div className="info-pair">
              <span className="label">Contact Mobile:</span>
              <span className="val">{passengerPhone}</span>
            </div>
          </div>

          <div className="ticket-section seat-price-section">
            <h3>💺 Reserved Seats & Fare</h3>
            <div className="seats-display-badge">
              <span className="seats-label">Seat No(s):</span>
              <div className="seats-pills">
                {seatNumbers.map((sNo) => (
                  <span key={sNo} className="seat-badge-pill">
                    Seat {sNo}
                  </span>
                ))}
              </div>
            </div>
            <div className="info-pair fare-total">
              <span className="label">Total Paid Fare:</span>
              <span className="val total-amount">₹{totalFare}</span>
            </div>
          </div>
        </div>

        {/* Bottom Verification QR Code & Instructions */}
        <div className="ticket-footer-strip">
          <div className="qr-code-area">
            {/* Visual SVG QR Code Graphic */}
            <svg width="90" height="90" viewBox="0 0 100 100" className="qr-svg">
              <rect width="100" height="100" fill="#ffffff" />
              <path d="M10 10 h30 v30 h-30 z M15 15 v20 h20 v-20 z M22 22 h6 v6 h-6 z" fill="#0f172a" />
              <path d="M60 10 h30 v30 h-30 z M65 15 v20 h20 v-20 z M72 22 h6 v6 h-6 z" fill="#0f172a" />
              <path d="M10 60 h30 v30 h-30 z M15 65 v20 h20 v-20 z M22 72 h6 v6 h-6 z" fill="#0f172a" />
              <rect x="50" y="50" width="10" height="10" fill="#0f172a" />
              <rect x="65" y="55" width="15" height="10" fill="#0f172a" />
              <rect x="55" y="70" width="20" height="15" fill="#0f172a" />
              <rect x="80" y="80" width="10" height="10" fill="#0f172a" />
            </svg>
            <span className="qr-caption">Scan to Verify Ticket</span>
          </div>

          <div className="boarding-rules-text">
            <h4>📌 Important Boarding Instructions</h4>
            <ul>
              <li>Please report at the boarding point 15 minutes before scheduled departure.</li>
              <li>Carry a valid Government-issued Photo ID proof along with this e-ticket.</li>
              <li>Emergency Contact Support: <strong>1800-BUSEASE (1800-287-3273)</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
