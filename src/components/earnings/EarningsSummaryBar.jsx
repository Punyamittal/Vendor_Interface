import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import './EarningsSummaryBar.css';

const StatCard = ({ title, amount, trend, trendValue }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="stat-card">
      <div className="stat-info">
        <p className="stat-title">{title}</p>
        <h2 className="stat-amount">{formatCurrency(amount)}</h2>
        <div className={`stat-trend ${trend}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{trendValue}% vs last period</span>
        </div>
      </div>
      <div className={`stat-icon-bg ${trend}`}>
        <IndianRupee size={24} />
      </div>
    </div>
  );
};

const EarningsSummaryBar = ({ stats }) => {
  return (
    <div className="summary-bar">
      <StatCard 
        title="Today's Revenue" 
        amount={stats.today} 
        trend={stats.trends.today >= 0 ? 'up' : 'down'}
        trendValue={Math.abs(stats.trends.today)}
      />
      <StatCard 
        title="This Week" 
        amount={stats.week} 
        trend={stats.trends.week >= 0 ? 'up' : 'down'}
        trendValue={Math.abs(stats.trends.week)}
      />
      <StatCard 
        title="This Month" 
        amount={stats.month} 
        trend={stats.trends.month >= 0 ? 'up' : 'down'}
        trendValue={Math.abs(stats.trends.month)}
      />
    </div>
  );
};

export default EarningsSummaryBar;
