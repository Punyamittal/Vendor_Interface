import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  liveOrders: [],
  pastOrders: [],
  shopOnline: true,
  loading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersStart: (state) => { state.loading = true; },
    setLiveOrders: (state, action) => {
      state.loading = false;
      state.liveOrders = action.payload;
    },
    setPastOrders: (state, action) => {
      state.loading = false;
      state.pastOrders = action.payload;
    },
    addOrder: (state, action) => {
      state.liveOrders.unshift(action.payload);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.liveOrders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        if (status === 'completed' || status === 'rejected') {
          state.liveOrders = state.liveOrders.filter(o => o.id !== orderId);
          // In real app, we might add it to pastOrders if we want to show it immediately
        }
      }
    },
    toggleShopStatus: (state) => {
      state.shopOnline = !state.shopOnline;
    },
    ordersError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchOrdersStart,
  setLiveOrders,
  setPastOrders,
  addOrder,
  updateOrderStatus,
  toggleShopStatus,
  ordersError,
} = ordersSlice.actions;
export default ordersSlice.reducer;
