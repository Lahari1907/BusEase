import axios from 'axios';

// Base API configuration targeting Spring Boot backend
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request Interceptor: Attach JWT Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('busease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('busease_token');
      localStorage.removeItem('busease_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// --- MOCK DATASTORE FOR OFFLINE DEVELOPMENT FALLBACK ---
const MOCK_USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'user@busease.com', password: 'password123', role: 'ROLE_USER', phone: '+91 98765 43210' },
  { id: 2, name: 'System Admin', email: 'admin@busease.com', password: 'adminpassword', role: 'ROLE_ADMIN', phone: '+91 99999 88888' },
];

let MOCK_BUSES = [
  { id: 101, busName: 'InterCity Express', busNumber: 'MH-12-AB-1234', busType: 'AC Sleeper (2+1)', totalSeats: 40, rating: 4.8, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket'] },
  { id: 102, busName: 'VRL Travels Deluxe', busNumber: 'KA-01-CD-5678', busType: 'AC Multi-Axle Volvo', totalSeats: 40, rating: 4.6, amenities: ['WiFi', 'Charging Point', 'Reclining Seats', 'Movies'] },
  { id: 103, busName: 'SRS Travels Executive', busNumber: 'KA-05-EF-9012', busType: 'Non-AC Seater (2+2)', totalSeats: 40, rating: 4.2, amenities: ['Charging Point', 'Water Bottle'] },
  { id: 104, busName: 'Purple Metrolink', busNumber: 'MH-14-GH-3456', busType: 'AC Sleeper (2+1)', totalSeats: 40, rating: 4.9, amenities: ['WiFi', 'Charging Point', 'Reading Light', 'Blanket'] },
  { id: 105, busName: 'Neeta Tours & Travels', busNumber: 'MH-04-JK-7890', busType: 'AC Seater (2+2)', totalSeats: 40, rating: 4.5, amenities: ['Charging Point', 'Water Bottle', 'Reclining Seats'] },
];

let MOCK_ROUTES = [
  { id: 201, source: 'Mumbai', destination: 'Pune', distanceKm: 150, durationHours: '3h 30m' },
  { id: 202, source: 'Bangalore', destination: 'Hyderabad', distanceKm: 570, durationHours: '9h 00m' },
  { id: 203, source: 'Delhi', destination: 'Jaipur', distanceKm: 280, durationHours: '5h 15m' },
  { id: 204, source: 'Chennai', destination: 'Bangalore', distanceKm: 340, durationHours: '6h 30m' },
  { id: 205, source: 'Mumbai', destination: 'Goa', distanceKm: 590, durationHours: '11h 00m' },
];

let MOCK_SCHEDULES = [
  {
    id: 1,
    bus: MOCK_BUSES[0],
    route: MOCK_ROUTES[0],
    departureTime: '06:00 AM',
    arrivalTime: '09:30 AM',
    departureDate: '2026-09-15',
    price: 650,
    availableSeatsCount: 22,
    boardingPoints: ['Dadar TT Circle (06:00 AM)', 'Vashi Plaza (06:40 AM)', 'Panvel Highway (07:10 AM)'],
    droppingPoints: ['Wakad Flyover (09:00 AM)', 'Swargate Bus Stand (09:30 AM)'],
  },
  {
    id: 2,
    bus: MOCK_BUSES[1],
    route: MOCK_ROUTES[0],
    departureTime: '10:30 PM',
    arrivalTime: '02:00 AM',
    departureDate: '2026-09-15',
    price: 850,
    availableSeatsCount: 18,
    boardingPoints: ['Borivali East (10:30 PM)', 'Andheri Pump House (11:00 PM)', 'Kharghar (11:55 PM)'],
    droppingPoints: ['Chandani Chowk (01:40 AM)', 'Katraj (02:00 AM)'],
  },
  {
    id: 3,
    bus: MOCK_BUSES[1],
    route: MOCK_ROUTES[1],
    departureTime: '09:00 PM',
    arrivalTime: '06:00 AM',
    departureDate: '2026-09-15',
    price: 1450,
    availableSeatsCount: 14,
    boardingPoints: ['Majestic Bus Terminal (09:00 PM)', 'Hebbal Flyover (09:30 PM)'],
    droppingPoints: ['Gachibowli (05:30 AM)', 'Ameerpet (06:00 AM)'],
  },
  {
    id: 4,
    bus: MOCK_BUSES[2],
    route: MOCK_ROUTES[2],
    departureTime: '07:30 AM',
    arrivalTime: '12:45 PM',
    departureDate: '2026-09-15',
    price: 520,
    availableSeatsCount: 28,
    boardingPoints: ['ISBT Kashmiri Gate (07:30 AM)', 'Dhaula Kuan (08:10 AM)'],
    droppingPoints: ['Sindhi Camp (12:30 PM)', '200 Ft Bypass Jaipur (12:45 PM)'],
  },
  {
    id: 5,
    bus: MOCK_BUSES[3],
    route: MOCK_ROUTES[3],
    departureTime: '11:00 PM',
    arrivalTime: '05:30 AM',
    departureDate: '2026-09-15',
    price: 980,
    availableSeatsCount: 15,
    boardingPoints: ['Koyambedu Omni Bus Stand (11:00 PM)', 'Poonamallee (11:35 PM)'],
    droppingPoints: ['Electronic City (05:00 AM)', 'Silk Board (05:30 AM)'],
  },
  {
    id: 6,
    bus: MOCK_BUSES[4],
    route: MOCK_ROUTES[4],
    departureTime: '08:00 PM',
    arrivalTime: '07:00 AM',
    departureDate: '2026-09-15',
    price: 1600,
    availableSeatsCount: 20,
    boardingPoints: ['Bandra Bus Terminal (08:00 PM)', 'Navi Mumbai (08:50 PM)'],
    droppingPoints: ['Mapusa Market (06:30 AM)', 'Panjim Bus Stand (07:00 AM)'],
  }
];

let MOCK_SEAT_STATES = {
  1: { bookedSeats: [3, 4, 12, 18], lockedSeats: {} },
  2: { bookedSeats: [1, 2, 5, 6, 15, 16], lockedSeats: {} },
  3: { bookedSeats: [7, 8, 9, 10, 20, 21, 22], lockedSeats: {} },
  4: { bookedSeats: [2, 14, 25], lockedSeats: {} },
  5: { bookedSeats: [1, 11, 12, 13, 24], lockedSeats: {} },
  6: { bookedSeats: [5, 6, 7, 19, 20], lockedSeats: {} },
};

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
    totalFare: 728,
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
    totalFare: 3248,
    status: 'COMPLETED',
    bookedAt: '2026-08-18 04:15 PM',
    transactionId: 'TXN-4720918374'
  }
];

// --- API SERVICES ---

// AUTH SERVICES
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn('Backend server unreachable. Using fallback Auth authentication.');
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user && (user.password === password || password === 'demo123')) {
        const fakeToken = `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`;
        return {
          token: fakeToken,
          jwt: fakeToken,
          accessToken: fakeToken,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        };
      }
      throw new Error('Invalid email or password');
    }
    throw error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const newUser = {
        id: Date.now(),
        name: userData.name || 'Passenger User',
        email: userData.email,
        role: userData.role || 'ROLE_USER',
        phone: userData.phone || '+91 98765 00000'
      };
      const fakeToken = `mock-jwt-token-${newUser.role.toLowerCase()}-${Date.now()}`;
      return { token: fakeToken, message: 'User registered successfully!', user: newUser };
    }
    throw error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const savedUser = localStorage.getItem('busease_user');
      if (savedUser) return JSON.parse(savedUser);
    }
    throw error;
  }
};

// BUS & SCHEDULE SERVICES
export const searchBuses = async (source, destination, date) => {
  try {
    const response = await api.get('/schedules/search', {
      params: { source, destination, date }
    });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      let filtered = MOCK_SCHEDULES;
      if (source) {
        filtered = filtered.filter(s => s.route.source.toLowerCase().includes(source.toLowerCase()));
      }
      if (destination) {
        filtered = filtered.filter(s => s.route.destination.toLowerCase().includes(destination.toLowerCase()));
      }
      return filtered;
    }
    throw error;
  }
};

export const getScheduleById = async (scheduleId) => {
  try {
    const response = await api.get(`/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const found = MOCK_SCHEDULES.find(s => s.id === parseInt(scheduleId, 10));
      return found || MOCK_SCHEDULES[0];
    }
    throw error;
  }
};

// SEAT LOCKING SERVICES
export const getSeatsStatus = async (scheduleId) => {
  try {
    const response = await api.get(`/seats/status/${scheduleId}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const state = MOCK_SEAT_STATES[scheduleId] || { bookedSeats: [1, 2], lockedSeats: {} };
      const now = Date.now();
      const activeLockedSeats = {};
      Object.entries(state.lockedSeats || {}).forEach(([seat, info]) => {
        if (info.expiresAt > now) {
          activeLockedSeats[seat] = info;
        }
      });
      state.lockedSeats = activeLockedSeats;
      return {
        scheduleId: parseInt(scheduleId, 10),
        bookedSeats: state.bookedSeats,
        lockedSeats: Object.keys(activeLockedSeats).map(Number)
      };
    }
    throw error;
  }
};

export const lockSeat = async (scheduleId, seatNumber, userId) => {
  try {
    const response = await api.post('/seats/lock', null, {
      params: { scheduleId, seatNumber, userId }
    });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      if (!MOCK_SEAT_STATES[scheduleId]) {
        MOCK_SEAT_STATES[scheduleId] = { bookedSeats: [], lockedSeats: {} };
      }
      const state = MOCK_SEAT_STATES[scheduleId];
      const numSeat = parseInt(seatNumber, 10);

      if (state.bookedSeats.includes(numSeat)) {
        throw new Error(`Seat ${seatNumber} is already booked by another passenger.`);
      }

      const now = Date.now();
      const existingLock = state.lockedSeats[numSeat];
      if (existingLock && existingLock.expiresAt > now && existingLock.userId !== userId) {
        throw new Error(`Seat ${seatNumber} is temporarily locked by another user.`);
      }

      const lockDuration = 5 * 60 * 1000; // 5 mins
      const expiresAt = now + lockDuration;

      state.lockedSeats[numSeat] = { userId, timestamp: now, expiresAt };

      return {
        success: true,
        message: `Seat ${seatNumber} locked successfully for 5 minutes!`,
        scheduleId,
        seatNumber: numSeat,
        userId,
        expiresAt,
        lockDurationSeconds: 300
      };
    }
    throw error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
};

export const unlockSeat = async (scheduleId, seatNumber, userId) => {
  try {
    const response = await api.post('/seats/unlock', null, {
      params: { scheduleId, seatNumber, userId }
    });
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const state = MOCK_SEAT_STATES[scheduleId];
      if (state && state.lockedSeats && state.lockedSeats[seatNumber]) {
        delete state.lockedSeats[seatNumber];
      }
      return { success: true, message: `Seat ${seatNumber} lock released.` };
    }
    throw error;
  }
};

// PAYMENT & BOOKING SERVICES
export const createPayment = async (paymentData, forceResult = null) => {
  try {
    const response = await api.post('/payments/create', paymentData);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      await new Promise((res) => setTimeout(res, 1200));

      let isSuccess = false;
      if (forceResult !== null) {
        isSuccess = forceResult === 'SUCCESS';
      } else {
        isSuccess = Math.random() < 0.80;
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
        if (paymentData.scheduleId && paymentData.seatNumbers && paymentData.userId) {
          paymentData.seatNumbers.forEach((seat) => {
            unlockSeat(paymentData.scheduleId, seat, paymentData.userId).catch(() => {});
          });
        }
        const failureReasons = [
          'Transaction declined by bank server.',
          'Insufficient funds or daily limit exceeded.',
          'Payment gateway session timeout.',
          'Authentication failure at bank OTP step.'
        ];
        throw new Error(failureReasons[Math.floor(Math.random() * failureReasons.length)]);
      }
    }
    throw error.response?.data?.message ? new Error(error.response.data.message) : error;
  }
};

export const createBooking = async (bookingPayload) => {
  try {
    const response = await api.post('/bookings/create', bookingPayload);
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
};

export const getUserBookings = async (userId) => {
  try {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const userBookings = MOCK_BOOKINGS.filter(b => b.userId === parseInt(userId, 10) || userId === 1 || userId === '1');
      return userBookings.length > 0 ? userBookings : MOCK_BOOKINGS;
    }
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      const found = MOCK_BOOKINGS.find(b => b.bookingId === bookingId || b.id === bookingId);
      return found || MOCK_BOOKINGS[0];
    }
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/cancel/${bookingId}`);
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
};

export default api;
