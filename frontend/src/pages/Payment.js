import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPayment, createBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatCurrency } from '../utils/helpers';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const stateData = location.state;

  if (!stateData || !stateData.selectedSeats || stateData.selectedSeats.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8 space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-sm text-slate-500">
            No seats selected or locked. Please select seats from the bus schedule first.
          </p>
          <Button onClick={() => navigate('/search')} variant="primary" className="w-full">
            Go to Search Buses
          </Button>
        </Card>
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

  // Processing & modal states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // null | 'SUCCESS' | 'FAILED'
  const [failureReason, setFailureReason] = useState('');
  const [forceSimResult, setForceSimResult] = useState('AUTO');

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
      const payRes = await createPayment(paymentPayload, forceFlag);

      if (payRes.status === 'SUCCESS' || payRes.success) {
        setPaymentStatus('SUCCESS');

        const bookingPayload = {
          userId: user?.id || 1,
          passengerName,
          passengerAge,
          passengerGender,
          passengerPhone,
          scheduleId: schedule.id,
          busName: schedule.bus?.busName || 'Express Bus',
          busNumber: schedule.bus?.busNumber || 'MH-12-AB-1234',
          source: schedule.route?.source || 'Origin',
          destination: schedule.route?.destination || 'Destination',
          departureDate: schedule.departureDate || '2026-09-15',
          departureTime: schedule.departureTime || '08:00 AM',
          arrivalTime: schedule.arrivalTime || '02:00 PM',
          seatNumbers: selectedSeats,
          totalFare: totalAmount,
          transactionId: payRes.transactionId
        };

        const newBooking = await createBooking(bookingPayload);
        showToast('🎉 Payment Successful! Ticket confirmed.', 'success');

        setTimeout(() => {
          navigate('/bookings');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900">💳 Express Payment Gateway</h2>
        <p className="text-xs text-slate-500">Complete payment within your 5-minute Redis seat lock window</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Passenger Info & Payment Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Passenger Details Form */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>👤</span> Passenger Details
            </h3>

            <form id="payment-form" onSubmit={handlePayNow} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">Passenger Name</label>
                  <input
                    type="text"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">Age</label>
                  <input
                    type="number"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(e.target.value)}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 uppercase">Gender</label>
                  <select
                    value={passengerGender}
                    onChange={(e) => setPassengerGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 uppercase">Mobile Phone</label>
                <input
                  type="text"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </form>
          </Card>

          {/* Payment Method Selector */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <span>💳</span> Payment Method
            </h3>

            <div className="flex gap-2 border-b border-slate-100 pb-3">
              {[
                { id: 'UPI', label: '📲 Instant UPI / QR' },
                { id: 'CARD', label: '💳 Credit / Debit Card' },
                { id: 'NETBANKING', label: '🏦 Net Banking' },
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all ${
                    paymentMethod === method.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              {paymentMethod === 'UPI' && (
                <div className="text-center space-y-2 py-2">
                  <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center text-3xl font-bold text-slate-400 shadow-sm">
                    📱 QR
                  </div>
                  <p className="font-medium text-slate-600">Scan & Pay via Google Pay / PhonePe / Paytm</p>
                  <p className="font-mono text-blue-700 font-bold">VPA: busease@icici</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="space-y-3 max-w-sm mx-auto py-2">
                  <input
                    type="text"
                    placeholder="Card Number"
                    defaultValue="4532 8910 1112 1314"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      defaultValue="123"
                      maxLength="3"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div className="py-2">
                  <select defaultValue="HDFC" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Simulation Controls */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1.5">
              <span className="font-bold text-amber-900 block">⚡ Payment Engine Simulation Modes:</span>
              <div className="flex flex-wrap gap-4 text-amber-800 font-medium">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'AUTO'}
                    onChange={() => setForceSimResult('AUTO')}
                  />
                  80% Success / 20% Fail Rate
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'FORCE_SUCCESS'}
                    onChange={() => setForceSimResult('FORCE_SUCCESS')}
                  />
                  Force 100% Success
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="sim"
                    checked={forceSimResult === 'FORCE_FAILURE'}
                    onChange={() => setForceSimResult('FORCE_FAILURE')}
                  />
                  Force Failure
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Booking Summary & Submit Button */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 space-y-5 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-base">{schedule?.bus?.busName || 'Express Bus'}</div>
              <p className="text-slate-500 font-medium">{schedule?.route?.source} ➔ {schedule?.route?.destination}</p>
              <p className="text-slate-500">Departure: {schedule?.departureTime}</p>
              <div className="pt-2 flex flex-wrap gap-1">
                {selectedSeats.map((s) => (
                  <span key={s} className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Seat #{s}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-b border-slate-100 py-3">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (12%)</span>
                <span className="font-semibold text-slate-800">₹{gstTax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-blue-600 text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <Button
              type="submit"
              form="payment-form"
              isLoading={isProcessing}
              variant="primary"
              className="w-full py-3.5 font-bold text-sm"
            >
              🔒 Pay {formatCurrency(totalAmount)}
            </Button>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      {paymentStatus === 'SUCCESS' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full text-center p-8 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-5xl animate-bounce">✅</div>
            <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-500">
              Your payment of {formatCurrency(totalAmount)} was processed. Generating your e-ticket...
            </p>
          </Card>
        </div>
      )}

      {/* Failure Modal */}
      {paymentStatus === 'FAILED' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-sm w-full text-center p-8 space-y-4">
            <div className="text-5xl">❌</div>
            <h3 className="text-xl font-bold text-slate-900">Payment Failed</h3>
            <p className="text-xs text-red-600 font-semibold">{failureReason}</p>
            <p className="text-[11px] text-slate-400">Your Redis seat lock has been auto-released.</p>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setPaymentStatus(null)} variant="primary" size="sm" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => navigate('/search')} variant="secondary" size="sm" className="flex-1">
                Back to Search
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payment;
