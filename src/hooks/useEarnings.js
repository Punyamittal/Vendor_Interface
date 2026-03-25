import { useDispatch, useSelector } from 'react-redux';
import { fetchEarningsStart, setEarningsStats, setChartsData, setTopItems, earningsError } from '../store/earningsSlice';
import { earningsService } from '../services/earningsService';

export const useEarnings = () => {
  const dispatch = useDispatch();
  const { stats, dailyRevenue, weeklyRevenue, topItems, loading, error } = useSelector((state) => state.earnings);
  const { user } = useSelector((state) => state.auth);

  const fetchEarningsData = async () => {
    if (!user) return;
    dispatch(fetchEarningsStart());
    try {
      const [statsRes, chartDataRes, topItemsRes] = await Promise.all([
        earningsService.getStats(user.shopId),
        earningsService.getStats(user.shopId), // Mocking charts from same endpoint or specialized one
        earningsService.getItemEarnings(user.shopId)
      ]);
      dispatch(setEarningsStats(statsRes));
      dispatch(setChartsData({ daily: statsRes.dailyHistory, weekly: statsRes.weeklyHistory }));
      dispatch(setTopItems(topItemsRes));
    } catch (err) {
      dispatch(earningsError(err.message));
    }
  };

  return { stats, dailyRevenue, weeklyRevenue, topItems, loading, error, fetchEarningsData };
};
