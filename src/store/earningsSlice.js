import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    today: 0,
    week: 0,
    month: 0,
    trends: {
      today: 0,
      week: 0,
      month: 0
    }
  },
  dailyRevenue: [],
  weeklyRevenue: [],
  topItems: [],
  loading: false,
  error: null,
};

const earningsSlice = createSlice({
  name: 'earnings',
  initialState,
  reducers: {
    fetchEarningsStart: (state) => { state.loading = true; },
    setEarningsStats: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    },
    setChartsData: (state, action) => {
      state.dailyRevenue = action.payload.daily;
      state.weeklyRevenue = action.payload.weekly;
    },
    setTopItems: (state, action) => {
      state.topItems = action.payload;
    },
    earningsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchEarningsStart,
  setEarningsStats,
  setChartsData,
  setTopItems,
  earningsError,
} = earningsSlice.actions;
export default earningsSlice.reducer;
