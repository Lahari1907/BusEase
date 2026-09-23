import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import SeatGrid from '../components/SeatGrid';

const Seats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const schedule = location.state?.schedule;

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [lockingSeat, setLockingSeat] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!schedule) {
      navigate('/');
      return;
    }
  }, [schedule, navigate]);

  // WebSocket Subscription for Real-time Seat updates
  useEffect(() => {
    if (!schedule?.id) return;

    let stompClient = null;
    try {
      stompClient = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws/seats'),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('Connected to WebSocket for seat updates');
          stompClient.subscribe(`/topic/seats/${schedule.id}`, (message) => {
            if (message.body) {
              const event = JSON.parse(message.body);
              if (event.status === 'LOCKED') {
                setLockedSeats((prev) => [...new Set([...prev, event.seatNumber])]);
              } else if (event.status === 'UNLOCKED') {
                setLockedSeats((prev) => prev.filter((s) => s !== event.seatNumber));
              }
            }
          });
        },
        onStompError: (frame) => {
          console.warn('STOMP broker error:', frame.headers['message']);
        },
      });

      stompClient.activate();
    } catch (err) {
      console.warn('WebSocket connection non-fatal error:', err);
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [schedule]);

  const handleSeatClick = async (seatNumber) => {
    if (!user || !user.id) {
      setError('You must be logged in to select and lock a seat.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLockingSeat(seatNumber);

    try {
      // Call Seat Lock API strictly matching backend query parameters
      const response = await API.post(
        `/seats/lock?scheduleId=${schedule.id}&seatNumber=${seatNumber}&userId=${user.id}`
      );

      if (response.data?.status === 'SUCCESS' || response.status === 200) {
        setSelectedSeat(seatNumber);
        setSuccessMsg(`Seat ${seatNumber} locked successfully! Proceed to payment within 5 minutes.`);
      } else {
        setError(response.data?.message || 'Failed to lock seat');
      }
    } catch (err) {
      console.error('Error locking seat:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Seat already locked or unavailable.'
      );
    } finally {
      setLockingSeat(null);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedSeat) return;
    navigate('/payment', {
      state: {
        schedule,
        seatNumber: selectedSeat,
        amount: schedule.price || 500,
      },
    });
  };

  if (!schedule) return null;

  const totalSeats = schedule.bus?.totalSeats || 20;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card">
        <h2>Select Seat</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Bus: <strong>{schedule.bus?.busName || schedule.busName || 'Express Bus'}</strong> • {schedule.route?.source || schedule.source} ➔ {schedule.route?.destination || schedule.destination}
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-info">{successMsg}</div>}

        <SeatGrid
          totalSeats={totalSeats}
          selectedSeat={selectedSeat}
          lockedSeats={lockedSeats}
          onSelectSeat={handleSeatClick}
          lockingSeat={lockingSeat}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div>
            {selectedSeat ? (
              <span>Selected Seat: <strong>#{selectedSeat}</strong></span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No seat selected</span>
            )}
          </div>

          <button
            onClick={handleProceedToPayment}
            className="btn btn-primary"
            disabled={!selectedSeat}
          >
            Proceed to Payment ➔
          </button>
        </div>
      </div>
    </div>
  );
};

export default Seats;
