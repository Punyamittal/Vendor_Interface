import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import menuReducer from './menuSlice';
import earningsReducer from './earningsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    menu: menuReducer,
    earnings: earningsReducer,
  },
});
