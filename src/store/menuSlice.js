import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    fetchMenuStart: (state) => { state.loading = true; },
    setItems: (state, action) => {
      state.loading = false;
      state.items = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateItemAvailability: (state, action) => {
      const { id, isAvailable } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.isAvailable = isAvailable;
      }
    },
    menuError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchMenuStart,
  setItems,
  addItem,
  updateItem,
  removeItem,
  updateItemAvailability,
  menuError,
} = menuSlice.actions;
export default menuSlice.reducer;
