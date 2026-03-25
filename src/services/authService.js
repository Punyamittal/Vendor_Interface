import api from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const authService = {
  login: async (credentials) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
};
