import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for global error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    
    // Customize error message based on status code
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      const { status } = error.response;
      
      if (status === 404) {
        errorMessage = 'The requested resource was not found';
      } else if (status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later';
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection';
    }
    
    // Return a rejected promise with structured error
    return Promise.reject({
      message: errorMessage,
      originalError: error
    });
  }
);

// Mock data for fallback when API fails
const mockData = {
  topCoins: [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 77345, market_cap: 1535622267490, price_change_percentage_24h: -1.22562 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 1488.06, market_cap: 179594102545, price_change_percentage_24h: -2.7582 },
    { id: 'tether', name: 'Tether', symbol: 'usdt', current_price: 0.999135, market_cap: 143890980564, price_change_percentage_24h: -0.04349 }
  ],
  bitcoinHistory: {
    coin_id: 'bitcoin',
    vs_currency: 'usd',
    days: '30',
    data: Array(30).fill(0).map((_, i) => ({
      date: new Date(Date.now() - (29-i) * 24 * 60 * 60 * 1000).toISOString(),
      price: 75000 + Math.random() * 5000,
      volume: 50000000000 + Math.random() * 10000000000,
      market_cap: 1500000000000 + Math.random() * 100000000000
    }))
  }
};

const api = {
  // Get list of top coins
  getTopCoins: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/api/coins`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top coins:', error);
      console.warn('Using fallback data for top coins');
      return mockData.topCoins.slice(0, limit);
    }
  },
  
  // Get data for a specific coin
  getCoinData: async (coinId) => {
    try {
      const response = await apiClient.get(`/api/coins/${coinId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data for coin ${coinId}:`, error);
      
      // For bitcoin, we can return mock data
      if (coinId === 'bitcoin') {
        console.warn('Using fallback data for bitcoin');
        return mockData.topCoins[0];
      }
      
      throw error;
    }
  },
  
  // Get historical data for a specific coin
  getCoinHistory: async (coinId, vs_currency = 'usd', days = '30') => {
    try {
      const response = await apiClient.get(`/api/coins/${coinId}/history`, {
        params: { vs_currency, days }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for coin ${coinId}:`, error);
      
      // Return mock data for bitcoin
      if (coinId === 'bitcoin') {
        console.warn('Using fallback data for bitcoin history');
        return {
          ...mockData.bitcoinHistory,
          days: days
        };
      }
      
      // For other coins, return empty data structure
      return {
        coin_id: coinId,
        vs_currency: vs_currency,
        days: days,
        data: []
      };
    }
  },
  
  // Get OHLC data for a specific coin
  getCoinOHLC: async (coinId, vs_currency = 'usd', days = 1) => {
    try {
      const response = await apiClient.get(`/api/coins/${coinId}/ohlc`, {
        params: { vs_currency, days }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching OHLC data for coin ${coinId}:`, error);
      
      // Return empty data structure
      return {
        coin_id: coinId,
        vs_currency: vs_currency,
        days: days,
        data: []
      };
    }
  },
  
  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get(`/api/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      return { status: 'error', message: error.message };
    }
  }
};

export default api;
