import API from './axiosConfig';

// In-memory mock state for standalone client testing when backend is offline
const MOCK_USERS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'user@busease.com',
    password: 'password123',
    role: 'ROLE_USER',
    phone: '+91 98765 43210'
  },
  {
    id: 2,
    name: 'System Admin',
    email: 'admin@busease.com',
    password: 'adminpassword',
    role: 'ROLE_ADMIN',
    phone: '+91 99999 88888'
  }
];

export const authApi = {
  // Login API call
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      // Fallback mock mode for standalone frontend testing if backend server is not running
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('Backend server http://localhost:8080 unreachable. Using mock Auth authentication.');
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && (user.password === password || password === 'demo123')) {
          const fakeToken = `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`;
          return {
            token: fakeToken,
            jwt: fakeToken,
            accessToken: fakeToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone
            }
          };
        }
        throw new Error('Invalid email or password');
      }
      throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
  },

  // Register API call
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        console.warn('Backend server unreachable. Using mock Auth registration.');
        const newUser = {
          id: Date.now(),
          name: userData.name || 'Passenger User',
          email: userData.email,
          role: userData.role || 'ROLE_USER',
          phone: userData.phone || '+91 98765 00000'
        };
        const fakeToken = `mock-jwt-token-${newUser.role.toLowerCase()}-${Date.now()}`;
        return {
          token: fakeToken,
          message: 'User registered successfully!',
          user: newUser
        };
      }
      throw error.response?.data?.message ? new Error(error.response.data.message) : error;
    }
  },

  // Get current authenticated user profile
  getProfile: async () => {
    try {
      const response = await API.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const savedUser = localStorage.getItem('busease_user');
        if (savedUser) return JSON.parse(savedUser);
      }
      throw error;
    }
  }
};

export default authApi;
