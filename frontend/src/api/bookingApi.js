import API from './axiosConfig';
import { busApi } from './busApi';

let MOCK_BOOKINGS = [
  {
    id: 'BK-89421',
    bookingId: 'BK-89421',
    userId: 1,
    passengerName: 'Rahul Sharma',
    passengerAge: 28,
    passengerGender: 'Male',
    passengerPhone: '+91 98765 43210',
    busName: 'InterCity Express',
    busNumber: 'MH-12-AB-1234',
    source: 'Mumbai',
    destination: 'Pune',
    departureDate: '2026-09-15',
    departureTime: '06:00 AM',
    arrivalTime: '09:30 AM',
    seatNumbers: [5],
    totalFare: 728, // 650 + GST
    status: 'CONFIRMED',
    bookedAt: '2026-09-14 10:30 AM',
    transactionId: 'TXN-9842104921'
  },
  {
    id: 'BK-73109',
    bookingId: 'BK-73109',
    userId: 1,
    passengerName: 'Rahul Sharma',
    passengerAge: 28,
    passengerGender: 'Male',
    passengerPhone: '+91 98765 43210',
    busName: 'VRL Travels Deluxe',
    busNumber: 'KA-01-CD-5678',
    source: 'Bangalore',
    destination: 'Hyderabad',
    departureDate: '2026-08-20',
    departureTime: '09:00 PM',
    arrivalTime: '06:00 AM',
    seatNumbers: [12, 13],
    totalFare: 3248, // 2900 + GST
    status: 'COMPLETED',
    bookedAt: '2026-08-18 04:15 PM',
    transactionId: 'TXN-4720918374'
  }
];

export const bookingApi = {
  // Process payment simulation (80% SUCCESS / 20% FAILURE)
  processPayment: async (paymentData, forceResult = null) => {
    try {
      const response = await API.post('/payments/create', paymentData);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('Backend server unreachable. Running Payment Simulation engine (80% Success / 20% Failure).');
        
        // Artificial processing delay (1.2 seconds) to feel like real payment gateway
        await new Promise((res) => setTimeout(res, 1200));

        let isSuccess = false;
        if (forceResult !== null) {
          isSuccess = forceResult === 'SUCCESS';
        } else {
          // 80% Success / 20% Failure simulation math
          const randomVal = Math.random();
          isSuccess = randomVal < 0.80;
        }

        if (isSuccess) {
          const txnId = `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
          return {
            success: true,
            status: 'SUCCESS',
            transactionId: txnId,
            message: 'Payment processed successfully! Confirmation generated.',
            amount: paymentData.amount
          };
        } else {
          // Failure path: auto release locked seat
          if (paymentData.scheduleId && paymentData.seatNumbers && paymentData.userId) {
            paymentData.seatNumbers.forEach((seat) => {
              busApi.unlockSeat(paymentData.scheduleId, seat, paymentData.userId).catch(() => {});
            });
          }
          const failureReasons = [
            'Transaction declined by bank server.',
            'Insufficient funds or daily limit exceeded.',
            'Payment gateway session timeout.',
            'Authentication failure at bank OTP step.'
          ];
          const randomReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
          
          throw new Error(randomReason);
        }
      }
      throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
  },

  // Create confirmed booking record after successful payment
  createBooking: async (bookingPayload) => {
    try {
      const response = await API.post('/bookings/create', bookingPayload);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const newBookingId = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
        const newBooking = {
          id: newBookingId,
          bookingId: newBookingId,
          userId: bookingPayload.userId || 1,
          passengerName: bookingPayload.passengerName || 'Passenger',
          passengerAge: bookingPayload.passengerAge || 25,
          passengerGender: bookingPayload.passengerGender || 'Male',
          passengerPhone: bookingPayload.passengerPhone || '+91 98765 43210',
          busName: bookingPayload.busName || 'Express Bus',
          busNumber: bookingPayload.busNumber || 'MH-01-AX-9999',
          source: bookingPayload.source || 'Origin',
          destination: bookingPayload.destination || 'Destination',
          departureDate: bookingPayload.departureDate || '2026-09-15',
          departureTime: bookingPayload.departureTime || '08:00 AM',
          arrivalTime: bookingPayload.arrivalTime || '02:00 PM',
          seatNumbers: bookingPayload.seatNumbers || [1],
          totalFare: bookingPayload.totalFare || 500,
          status: 'CONFIRMED',
          bookedAt: new Date().toLocaleString(),
          transactionId: bookingPayload.transactionId || `TXN-${Date.now()}`
        };

        MOCK_BOOKINGS.unshift(newBooking);
        return newBooking;
      }
      throw error;
    }
  },

  // Get booking history by user ID
  getUserBookings: async (userId) => {
    try {
      const response = await API.get(`/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const userBookings = MOCK_BOOKINGS.filter(b => b.userId === parseInt(userId, 10) || userId === 1 || userId === '1');
        return userBookings.length > 0 ? userBookings : MOCK_BOOKINGS;
      }
      throw error;
    }
  },

  // Get single booking by booking ID
  getBookingById: async (bookingId) => {
    try {
      const response = await API.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const found = MOCK_BOOKINGS.find(b => b.bookingId === bookingId || b.id === bookingId);
        return found || MOCK_BOOKINGS[0];
      }
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await API.post(`/bookings/cancel/${bookingId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const booking = MOCK_BOOKINGS.find(b => b.bookingId === bookingId || b.id === bookingId);
        if (booking) {
          booking.status = 'CANCELLED';
        }
        return { success: true, message: `Booking ${bookingId} cancelled successfully. Refund initiated.` };
      }
      throw error;
    }
  }
};

export default bookingApi;
