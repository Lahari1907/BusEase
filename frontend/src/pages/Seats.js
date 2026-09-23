import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getScheduleById, getSeatsStatus, lockSeat, unlockSeat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { formatCurrency, getSeatStatusStyle } from '../utils/helpers';

const Seats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scheduleId: paramScheduleId } = useParams();
  const { user, showToast } = useAuth();

  const [schedule, setSchedule] = useState(location.state?.schedule || null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [lockingSeatNo, setLockingSeatNo] = useState(null);
  const [loading, setLoading] = useState(!schedule);
  const [errorMsg, setErrorMsg] = useState('');

  // 5-Minute Redis Seat Lock Timer (300 seconds)
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const scheduleId = schedule?.id || paramScheduleId || 1;

  const loadSeatsData = async () => {
    try {
      if (!schedule) {
        const schedData = await getScheduleById(scheduleId);
        setSchedule(schedData);
      }
      const statusData = await getSeatsStatus(scheduleId);
      setBookedSeats(statusData.bookedSeats || []);
      setLockedSeats(statusData.lockedSeats || []);
    } catch (err) {
      setErrorMsg('Failed to load seat layout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatsData();

    // Auto refresh seat status every 15 seconds
    const interval = setInterval(() => {
      getSeatsStatus(scheduleId).then((data) => {
        setBookedSeats(data.bookedSeats || []);
        setLockedSeats(data.lockedSeats || []);
      });
    }, 15000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [scheduleId]);

  // Timer logic
  useEffect(() => {
    if (selectedSeats.length > 0 && timeLeft === null) {
      setTimeLeft(300); // 5 minutes
    } else if (selectedSeats.length === 0) {
      setTimeLeft(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [selectedSeats]);

  useEffect(() => {
    if (timeLeft === 300) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleLockExpiration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [timeLeft]);

  const handleLockExpiration = async () => {
    showToast('⌛ Your 5-minute seat lock has expired! Seats released.', 'warning');
    for (const seatNo of selectedSeats) {
      await unlockSeat(scheduleId, seatNo, user?.id || 1);
    }
    setSelectedSeats([]);
    setTimeLeft(null);
    loadSeatsData();
  };

  const handleSeatClick = async (seatNo) => {
    setErrorMsg('');

    if (bookedSeats.includes(seatNo)) {
      showToast(`Seat ${seatNo} is already booked.`, 'error');
      return;
    }

    // Toggle off if already selected
    if (selectedSeats.includes(seatNo)) {
      try {
        await unlockSeat(scheduleId, seatNo, user?.id || 1);
        setSelectedSeats((prev) => prev.filter((s) => s !== seatNo));
        showToast(`Seat ${seatNo} unselected.`, 'info');
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Lock seat via API
    setLockingSeatNo(seatNo);
    try {
      const res = await lockSeat(scheduleId, seatNo, user?.id || 1);
      if (res.success) {
        setSelectedSeats((prev) => [...prev, seatNo]);
        showToast(`⚡ Seat ${seatNo} locked for 5 minutes via Redis!`, 'success');
      }
    } catch (err) {
      setErrorMsg(err.message || `Could not lock Seat ${seatNo}. It may be locked by another passenger.`);
      showToast(err.message || 'Seat lock failed', 'error');
    } finally {
      setLockingSeatNo(null);
    }
  };

  const formatTimer = (seconds) => {
    if (!seconds && seconds !== 0) return '05:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const totalSeats = 40;
  const baseFarePerSeat = schedule?.price || 500;
  const subtotal = selectedSeats.length * baseFarePerSeat;
  const gstTax = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + gstTax;

  const handleProceedToPayment = () => {
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least one seat to lock before proceeding.');
      return;
    }

    navigate('/payment', {
      state: {
        schedule,
        selectedSeats,
        baseFare: baseFarePerSeat,
        subtotal,
        gstTax,
        totalAmount,
        lockExpiresIn: timeLeft
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader label="Loading seat layout..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Summary */}
      <Card className="p-6 bg-white border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Select Seats - {schedule?.bus?.busName || 'Express Bus'}
          </h2>
          <p className="text-xs text-slate-500 font-medium pt-1">
            {schedule?.route?.source || 'Origin'} ➔ {schedule?.route?.destination || 'Destination'} | Departure: {schedule?.departureTime || '08:00 AM'}
          </p>
        </div>

        {/* Lock Timer */}
        {selectedSeats.length > 0 && timeLeft !== null && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-xl animate-bounce">⏳</span>
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Redis Seat Lock Expiry</span>
              <span className="text-lg font-extrabold text-amber-900 tracking-wider font-mono">{formatTimer(timeLeft)}</span>
            </div>
          </div>
        )}
      </Card>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seat Selection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 40-Seat Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            
            {/* Color Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 pb-6 mb-6 border-b border-slate-100 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-emerald-500 inline-block shadow-sm"></span>
                <span className="text-slate-700">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-red-500 inline-block opacity-80"></span>
                <span className="text-slate-700">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-amber-400 inline-block shadow-sm"></span>
                <span className="text-slate-700">Locked / Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-blue-600 inline-block shadow-sm"></span>
                <span className="text-slate-700">Selected (You)</span>
              </div>
            </div>

            {/* Bus Layout Container */}
            <div className="max-w-md mx-auto bg-slate-100 p-6 rounded-3xl border-2 border-slate-200 space-y-6">
              
              {/* Bus Driver Wheel Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-slate-300">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">FRONT ENTRANCE</span>
                <span className="text-2xl text-slate-400" title="Driver Wheel">☸️ Driver</span>
              </div>

              {/* 40 Seats Grid (10 Rows x 4 Columns with Middle Aisle) */}
              <div className="grid grid-cols-5 gap-3 text-center">
                {Array.from({ length: totalSeats }, (_, i) => i + 1).map((seatNo) => {
                  const isBooked = bookedSeats.includes(seatNo);
                  const isLocked = lockedSeats.includes(seatNo) && !selectedSeats.includes(seatNo);
                  const isSelected = selectedSeats.includes(seatNo);
                  const isLockingThis = lockingSeatNo === seatNo;

                  let status = 'AVAILABLE';
                  if (isBooked) status = 'BOOKED';
                  else if (isLocked) status = 'LOCKED';
                  else if (isSelected) status = 'SELECTED';

                  // Add empty column for aisle after column 2
                  const colInRow = (seatNo - 1) % 4;
                  const showAisleBefore = colInRow === 2;

                  return (
                    <React.Fragment key={seatNo}>
                      {showAisleBefore && <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">│</div>}
                      <button
                        type="button"
                        disabled={isBooked || isLocked || isLockingThis}
                        onClick={() => handleSeatClick(seatNo)}
                        className={`h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${getSeatStatusStyle(status)}`}
                      >
                        {isLockingThis ? '⏳' : seatNo}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="text-center pt-3 border-t-2 border-dashed border-slate-300">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BACK OF BUS</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Booking Summary & Checkout Action */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 space-y-5 sticky top-24">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Booking & Fare Summary
            </h3>

            {/* Selected Seats Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Selected Seats</span>
              {selectedSeats.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatNo) => (
                    <span key={seatNo} className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-lg">
                      Seat #{seatNo}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No seats selected yet. Click on available green seats.</p>
              )}
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-2 text-xs border-t border-b border-slate-100 py-3">
              <div className="flex justify-between text-slate-600">
                <span>Base Fare ({selectedSeats.length} seat × ₹{baseFarePerSeat})</span>
                <span className="font-semibold text-slate-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST & Platform Fee (12%)</span>
                <span className="font-semibold text-slate-800">₹{gstTax}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span className="text-blue-600 text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <Button
              onClick={handleProceedToPayment}
              disabled={selectedSeats.length === 0}
              variant="primary"
              className="w-full py-3.5 font-bold text-sm"
            >
              Proceed to Payment ➔
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Seats;
