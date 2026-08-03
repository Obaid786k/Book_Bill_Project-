// TODO: Real Supabase wiring in Backend Phase
// These functions currently simulate network latency and return mock responses.

const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers = {}; // In-memory mock DB

export const authService = {
  login: async (email, password) => {
    await delay();
    if (email === 'error@test.com') {
      throw new Error('Invalid credentials');
    }
    return {
      id: 'mock-uuid-123',
      email,
      name: mockUsers[email] || 'Test User',
      hasCompletedSetup: email === 'setup@test.com' // Use this to test passing setup directly
    };
  },

  signup: async (name, email, password) => {
    await delay();
    if (email === 'exists@test.com') {
      throw new Error('Email already registered');
    }
    mockUsers[email] = name;
    
    return {
      id: 'mock-uuid-123',
      email,
      name: name,
      hasCompletedSetup: false
    };
  },

  resetPassword: async (email) => {
    await delay();
    if (email === 'error@test.com') {
      throw new Error('User not found');
    }
    return true;
  },

  resendVerification: async (email) => {
    await delay();
    return true;
  },

  saveBusinessSetup: async (data) => {
    await delay(1200);
    console.log("Mock saved business setup data to DB:", data);
    return true;
  }
};
