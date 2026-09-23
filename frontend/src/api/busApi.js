import API from './axiosConfig';

// Mock dataset for offline / standalone mode fallback
let MOCK_BUSES = [
  { id: 101, busName: 'InterCity Express', busNumber: 'MH-12-AB-1234', busType: 'AC Sleeper (2+1)', totalSeats: 30, rating: 4.8, amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket'] },
  { id: 102, busName: 'VRL Travels Deluxe', busNumber: 'KA-01-CD-5678', busType: 'AC Multi-Axle Volvo', totalSeats: 36, rating: 4.6, amenities: ['WiFi', 'Charging Point', 'Reclining Seats', 'Movies'] },
  { id: 103, busName: 'SRS Travels Executive', busNumber: 'KA-05-EF-9012', busType: 'Non-AC Seater (2+2)', totalSeats: 40, rating: 4.2, amenities: ['Charging Point', 'Water Bottle'] },
  { id: 104, busName: 'Purple Metrolink', busNumber: 'MH-14-GH-3456', busType: 'AC Sleeper (2+1)', totalSeats: 30, rating: 4.9, amenities: ['WiFi', 'Charging Point', 'Reading Light', 'Blanket'] },
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

// Redis seat lock state tracking in mock mode
// key: scheduleId, value: { lockedSeats: { seatNo: { userId, timestamp, expiresAt } }, bookedSeats: [seatNo] }
let MOCK_SEAT_STATES = {
  1: { bookedSeats: [3, 4, 12, 18], lockedSeats: {} },
  2: { bookedSeats: [1, 2, 5, 6, 15, 16], lockedSeats: {} },
  3: { bookedSeats: [7, 8, 9, 10, 20, 21, 22], lockedSeats: {} },
  4: { bookedSeats: [2, 14, 25], lockedSeats: {} },
  5: { bookedSeats: [1, 11, 12, 13, 24], lockedSeats: {} },
  6: { bookedSeats: [5, 6, 7, 19, 20], lockedSeats: {} },
};

export const busApi = {
  // Search schedules by source, destination, date
  searchSchedules: async (source, destination, date) => {
    try {
      const response = await API.get('/schedules/search', {
        params: { source, destination, date }
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('Using mock schedules search data');
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
  },

  // Get specific schedule details by ID
  getScheduleById: async (scheduleId) => {
    try {
      const response = await API.get(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const found = MOCK_SCHEDULES.find(s => s.id === parseInt(scheduleId, 10));
        if (found) return found;
        return MOCK_SCHEDULES[0];
      }
      throw error;
    }
  },

  // Get seats status for a schedule
  getSeatsStatus: async (scheduleId) => {
    try {
      const response = await API.get(`/seats/status/${scheduleId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const state = MOCK_SEAT_STATES[scheduleId] || { bookedSeats: [1, 2], lockedSeats: {} };
        const now = Date.now();
        // Clear expired locks (> 5 mins = 300,000ms)
        const activeLockedSeats = {};
        Object.entries(state.lockedSeats).forEach(([seat, info]) => {
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
  },

  // Lock a seat using Redis backend endpoint (POST /seats/lock?scheduleId=...&seatNumber=...&userId=...)
  lockSeat: async (scheduleId, seatNumber, userId) => {
    try {
      const response = await API.post('/seats/lock', null, {
        params: { scheduleId, seatNumber, userId }
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn(`Simulating Redis Seat Lock for Schedule ${scheduleId}, Seat ${seatNumber}`);
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

        // Lock valid for 5 minutes (300 seconds)
        const lockDuration = 5 * 60 * 1000;
        const expiresAt = now + lockDuration;

        state.lockedSeats[numSeat] = {
          userId,
          timestamp: now,
          expiresAt
        };

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
  },

  // Unlock seat (POST /seats/unlock?scheduleId=...&seatNumber=...&userId=...)
  unlockSeat: async (scheduleId, seatNumber, userId) => {
    try {
      const response = await API.post('/seats/unlock', null, {
        params: { scheduleId, seatNumber, userId }
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const state = MOCK_SEAT_STATES[scheduleId];
        if (state && state.lockedSeats[seatNumber]) {
          delete state.lockedSeats[seatNumber];
        }
        return { success: true, message: `Seat ${seatNumber} lock released.` };
      }
      throw error;
    }
  },

  // --- ADMIN APIs ---
  getAllBuses: async () => {
    try {
      const response = await API.get('/admin/buses');
      return response.data;
    } catch (error) {
      return MOCK_BUSES;
    }
  },

  createBus: async (busData) => {
    try {
      const response = await API.post('/admin/buses', busData);
      return response.data;
    } catch (error) {
      const newBus = { id: Date.now(), rating: 4.5, amenities: ['WiFi', 'Water Bottle'], ...busData };
      MOCK_BUSES.unshift(newBus);
      return newBus;
    }
  },

  deleteBus: async (busId) => {
    try {
      await API.delete(`/admin/buses/${busId}`);
      return true;
    } catch (error) {
      MOCK_BUSES = MOCK_BUSES.filter(b => b.id !== busId);
      return true;
    }
  },

  getAllRoutes: async () => {
    try {
      const response = await API.get('/admin/routes');
      return response.data;
    } catch (error) {
      return MOCK_ROUTES;
    }
  },

  createRoute: async (routeData) => {
    try {
      const response = await API.post('/admin/routes', routeData);
      return response.data;
    } catch (error) {
      const newRoute = { id: Date.now(), ...routeData };
      MOCK_ROUTES.unshift(newRoute);
      return newRoute;
    }
  },

  deleteRoute: async (routeId) => {
    try {
      await API.delete(`/admin/routes/${routeId}`);
      return true;
    } catch (error) {
      MOCK_ROUTES = MOCK_ROUTES.filter(r => r.id !== routeId);
      return true;
    }
  },

  getAllSchedules: async () => {
    try {
      const response = await API.get('/admin/schedules');
      return response.data;
    } catch (error) {
      return MOCK_SCHEDULES;
    }
  },

  createSchedule: async (schedulePayload) => {
    try {
      const response = await API.post('/admin/schedules', schedulePayload);
      return response.data;
    } catch (error) {
      const busObj = MOCK_BUSES.find(b => b.id === parseInt(schedulePayload.busId, 10)) || MOCK_BUSES[0];
      const routeObj = MOCK_ROUTES.find(r => r.id === parseInt(schedulePayload.routeId, 10)) || MOCK_ROUTES[0];
      const newSched = {
        id: Date.now(),
        bus: busObj,
        route: routeObj,
        departureTime: schedulePayload.departureTime,
        arrivalTime: schedulePayload.arrivalTime,
        departureDate: schedulePayload.departureDate || '2026-09-15',
        price: parseFloat(schedulePayload.price),
        availableSeatsCount: busObj.totalSeats,
        boardingPoints: ['Main Terminal (08:00 AM)', 'City Center (08:30 AM)'],
        droppingPoints: ['Central Station (02:00 PM)'],
      };
      MOCK_SCHEDULES.unshift(newSched);
      return newSched;
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      await API.delete(`/admin/schedules/${scheduleId}`);
      return true;
    } catch (error) {
      MOCK_SCHEDULES = MOCK_SCHEDULES.filter(s => s.id !== scheduleId);
      return true;
    }
  }
};

export default busApi;
