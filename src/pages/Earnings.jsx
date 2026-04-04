import React, { useEffect, useState } from 'react';
import VendorShell from '../components/layout/VendorShell';
import EarningsSummaryBar from '../components/earnings/EarningsSummaryBar';
import DailyRevenueChart from '../components/earnings/DailyRevenueChart';
import TopItemsEarnings from '../components/earnings/TopItemsEarnings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { earningsService } from '../services/earningsService';
import { computeEarningsStats } from '../utils/revenueTrends';
import './Earnings.css';

const Earnings = () => {
  const { shopId } = useAuth();
  const [stats, setStats] = useState({ today: 0, week: 0, month: 0, trends: { today: 0, week: 0, month: 0 } });
  const [dailyHistory, setDailyHistory] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) fetchData();
  }, [shopId]);

  const fetchData = async () => {
    setLoading(true);
    const [earningsRes, topItemsRes] = await Promise.all([
      earningsService.getEarnings(shopId, 60),
      earningsService.getTopEarningItems(shopId)
    ]);

    if (!earningsRes.error && earningsRes.data) {
      setDailyHistory(earningsRes.data);
      setStats(computeEarningsStats(earningsRes.data));
    }

    if (!topItemsRes.error) {
      setTopItems(topItemsRes.data.map(item => ({
        ...item,
        orderCount: item.order_count,
        revenue: item.total_revenue,
        contribution: item.revenue_percentage
      })));
    }
    setLoading(false);
  };

  if (loading) return <VendorShell title="Earnings"><LoadingSpinner /></VendorShell>;

  return (
    <VendorShell title="Earnings & Performance">
      <EarningsSummaryBar stats={stats} />
      
      <div className="charts-row">
        <DailyRevenueChart
          data={dailyHistory
            .slice(-30)
            .map((d) => ({ day: d.day.slice(5), revenue: d.total_revenue }))}
        />
        {/* ... Info Card ... */}
      </div>

      <TopItemsEarnings data={topItems} />
    </VendorShell>
  );
};

export default Earnings;
