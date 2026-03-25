const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  ORDERS: {
    LIVE: (shopId) => `${API_BASE_URL}/orders/live/${shopId}`,
    PAST: (shopId) => `${API_BASE_URL}/orders/past/${shopId}`,
    UPDATE_STATUS: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,
  },
  MENU: {
    BASE: `${API_BASE_URL}/menu`,
    BY_SHOP: (shopId) => `${API_BASE_URL}/menu/${shopId}`,
    ITEM: (itemId) => `${API_BASE_URL}/menu/item/${itemId}`,
    UPDATE_AVAILABILITY: (itemId) => `${API_BASE_URL}/menu/item/${itemId}/availability`,
  },
  EARNINGS: {
    BY_PERIOD: (shopId) => `${API_BASE_URL}/earnings/${shopId}`,
    BY_ITEMS: (shopId) => `${API_BASE_URL}/earnings/${shopId}/items`,
  },
};
