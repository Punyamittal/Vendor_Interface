import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const menuService = {
  getMenuItems: (shopId) => {
    return api.get(API_ENDPOINTS.MENU.BY_SHOP(shopId));
  },
  addItem: (item) => {
    return api.post(API_ENDPOINTS.MENU.BASE, item);
  },
  updateItem: (itemId, item) => {
    return api.put(API_ENDPOINTS.MENU.ITEM(itemId), item);
  },
  deleteItem: (itemId) => {
    return api.delete(API_ENDPOINTS.MENU.ITEM(itemId));
  },
  updateAvailability: (itemId, isAvailable) => {
    return api.patch(API_ENDPOINTS.MENU.UPDATE_AVAILABILITY(itemId), { isAvailable });
  },
};
