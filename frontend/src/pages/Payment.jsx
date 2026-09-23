import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const stateData = location.state;

  // Strict business rule enforcement: Cannot access payment without seat selection!
  if (!stateData || !stateData.selectedSeats || stateData.selectedSeats.length === 0) {
    return (
      <div className="payment-page-container text-center">
        <div className="payment-error-box">
          <h2>⚠️ Access Denied</h2>
          <p>No seats selected or locked. Please select seats from the bus schedule first.</p>
          <button className="btn-primary" onClick={() => navigate('/search')}>
            Go to Search Buses
          </button>
        </div>
      </div>
    );
  }

  const { schedule, selectedSeats, subtotal, gstTax, totalAmount } = stateData;

  // Form states
  const [passengerName, setPassengerName] = useState(user?.name || 'Rahul Sharma');
  const [passengerAge, setPassengerAge] = useState(28);
  const [passengerGender, setPassengerGender] = useState('Male');
  const [passengerPhone, setPassengerPhone] = useState(user?.phone || '+91 98765 43210');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Simulation controls
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'SUCCESS' | 'FAILED'
  const [failureReason, setFailureReason] = useState('');
  const [forceSimResult, setForceSimResult] = useState('AUTO'); // 'AUTO' (80/20) | 'FORCE_SUCCESS' | 'FORCE_FAILURE'

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!passengerName || !passengerPhone) {
      showToast('Please provide passenger details.', 'warning');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(null);
    setFailureReason('');

    const paymentPayload = {
      amount: totalAmount,
      currency: 'INR',
      scheduleId: schedule.id,
      seatNumbers: selectedSeats,
      userId: user?.id || 1,
      paymentMethod
    };

    let forceFlag = null;
    if (forceSimResult === 'FORCE_SUCCESS') forceFlag = 'SUCCESS';
    if (forceSimResult === 'FORCE_FAILURE') forceFlag = 'FAILED';

    try {
      // Execute 80% / 20% payment simulation API
      const payRes = await bookingApi.processPayment(paymentPayload, forceFlag);

      if (payRes.status === 'SUCCESS' || payRes.success) {
        setPaymentStatus('SUCCESS');

        // Create booking record
        const bookingPayload = {
          userId: user?.id || 1,
          passengerName,
          passengerAge,
          passengerGender,
          passengerPhone,
          scheduleId: schedule.id,
          busName: schedule.bus?.busName,
          busNumber: schedule.bus?.busNumber,
          source: schedule.route?.source,
          destination: schedule.route?.destination,
          departureDate: schedule.departureDate || '2026-09-15',
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          seatNumbers: selectedSeats,
          totalFare: totalAmount,
          transactionId: payRes.transactionId
        };

        const newBooking = await bookingApi.createBooking(bookingPayload);
        showToast('🎉 Payment Successful! Ticket confirmed.', 'success');

        // Delay slightly for success animation before navigating to ticket
        setTimeout(() => {
          navigate(`/ticket/${newBooking.bookingId || newBooking.id}`);
        }, 1500);
      }
    } catch (err) {
      setPaymentStatus('FAILED');
      const errorMsg = err.message || 'Payment simulation failed. Seat lock released.';
      setFailureReason(errorMsg);
      showToast(`❌ Payment Failed: ${errorMsg}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page-container">
      <div className="payment-header">
        <h2>💳 Express Payment Gateway Simulation</h2>
        <p>Complete payment within your 5-minute Redis seat lock window</p>
      </div>

      <div className="payment-grid-layout">
        {/* Left Column: Passenger Details & Payment Methods */}
        <div className="payment-forms-column">
          {/* Passenger Information Card */}
          <div className="payment-card">
            <h3>👤 Passenger Details</h3>
            <form id="payment-form" onSubmit={handlePayNow} className="passenger-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Full Passenger Name</label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group flex-small">
                  <label>Age</label>
                  <input
                    type="number"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(e.target.value)}
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div className="form-group flex-small">
                  <label>Gender</label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mobile Number (for SMS Ticket & OTP)</label>
                <input
                  type="text"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  required
                />
              </div>
            </form>
          </div>

          {/* Payment Method Selector */}
          <div className="payment-card">
            <h3>💳 Select Payment Method</h3>
            <div className="payment-tabs">
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                📲 Instant UPI / QR Code
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                💳 Credit / Debit Card
              </button>
              <button
                type="button"
                className={`pay-tab ${paymentMethod === 'NETBANKING' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('NETBANKING')}
              >
                🏦 Net Banking
              </button>
            </div>

            <div className="pay-tab-content">
              {paymentMethod === 'UPI' && (
                <div className="upi-simulation-box">
                  <div className="qr-placeholder">
                    <div className="qr-code-box">📱 Scan & Pay via GPay / PhonePe / Paytm</div>
                  </div>
                  <p className="upi-id-text">Virtual Payment Address: <strong>busease@icici</strong></p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="card-simulation-fields">
                  <input type="text" placeholder="Card Number (4000 1234 5678 9010)" defaultValue="4532 8910 1112 1314" />
                  <div className="form-row">
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" />
                    <input type="password" placeholder="CVV" defaultValue="123" maxLength="3" />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="netbanking-options">
                  <select defaultValue="HDFC">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Payment Simulation Test Mode Controller */}
            <div className="simulation-tester-box">
              <span className="sim-label">⚡ Simulation Test Controller (80% Success Rate Engine):</span>
              <div className="sim-options">
                <label>
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'AUTO'}
                    onChange={() => setForceSimResult('AUTO')}
                  />
                  Real 80% Success / 20% Failure API Logic
                </label>
                <label>
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'FORCE_SUCCESS'}
                    onChange={() => setForceSimResult('FORCE_SUCCESS')}
                  />
                  Test 100% Success Flow
                </label>
                <label>
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'FORCE_FAILURE'}
                    onChange={() => setForceSimResult('FORCE_FAILURE')}
                  />
                  Test Payment Failure Flow
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pay Action Button */}
        <div className="payment-summary-column">
          <div className="payment-card summary-box">
            <h3>📋 Booking Summary</h3>

            <div className="summary-bus-title">
              <h4>{schedule?.bus?.busName}</h4>
              <p>{schedule?.bus?.busType}</p>
            </div>

            <div className="summary-trip-details">
              <p><strong>Route:</strong> {schedule?.route?.source} ➔ {schedule?.route?.destination}</p>
              <p><strong>Departure:</strong> {schedule?.departureTime} ({schedule?.departureDate || '2026-09-15'})</p>
              <p><strong>Seats Reserved:</strong> {selectedSeats.map(s => `Seat ${s}`).join(', ')}</p>
            </div>

            <hr className="summary-divider" />

            <div className="summary-costs">
              <div className="cost-item">
                <span>Seats Base Fare</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="cost-item">
                <span>Taxes & GST (12%)</span>
                <span>₹{gstTax}</span>
              </div>
              <hr className="summary-divider sub" />
              <div className="cost-item total">
                <span>Grand Total</span>
                <span className="total-price">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              form="payment-form"
              className="btn-pay-now-primary"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>🔄 Processing Secure Payment...</span>
              ) : (
                <span>🔒 Pay ₹{totalAmount} & Confirm Booking</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS OVERLAY MODAL */}
      {paymentStatus === 'SUCCESS' && (
        <div className="payment-modal-overlay">
          <div className="payment-modal success">
            <div className="modal-icon animate-pop">✅</div>
            <h2>Payment Successful!</h2>
            <p>Your payment of ₹{totalAmount} was processed successfully.</p>
            <p className="modal-sub">Generating your official BusEase ticket...</p>
            <div className="modal-loading-bar"></div>
          </div>
        </div>
      )}

      {/* FAILURE OVERLAY MODAL */}
      {paymentStatus === 'FAILED' && (
        <div className="payment-modal-overlay">
          <div className="payment-modal failure">
            <div className="modal-icon animate-pop">❌</div>
            <h2>Payment Failed (20% Simulation Triggered)</h2>
            <p className="failure-reason-text">Reason: {failureReason}</p>
            <p className="modal-sub">Your Redis seat lock has been released to prevent phantom holds.</p>
            
            <div className="modal-actions">
              <button
                className="btn-modal-retry"
                onClick={() => setPaymentStatus(null)}
              >
                🔄 Try Payment Again
              </button>
              <button
                className="btn-modal-back"
                onClick={() => navigate(`/seat-selection/${schedule.id}`)}
              >
                💺 Re-Select Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
