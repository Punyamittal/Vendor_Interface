import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './ChartStyle.css';

const DailyRevenueChart = ({ data }) => {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Daily Revenue</h3>
        <p>Last 30 days performance</p>
      </div>
        <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="barAccent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="barMuted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(249, 115, 22, 0.08)' }}
              contentStyle={{
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(22, 30, 48, 0.95)',
                color: '#f1f5f9',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
              }}
            />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === data.length - 1
                      ? 'url(#barAccent)'
                      : 'url(#barMuted)'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyRevenueChart;
