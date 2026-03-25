import React from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import './TopItemsEarnings.css';

const TopItemsEarnings = ({ data }) => {
  return (
    <div className="top-items-table card-layout glass-effect">
      <div className="chart-header">
        <h3>Top Selling Items</h3>
        <p>Performance based on total revenue</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Item Name</th>
            <th>Orders</th>
            <th>Revenue</th>
            <th>Contribution</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id}>
              <td>
                <span className={`rank-badge rank-${idx + 1}`}>{idx + 1}</span>
              </td>
              <td>
                <div className="item-name-cell">
                  <div className="item-sm-avatar">🍔</div>
                  <span>{item.name}</span>
                </div>
              </td>
              <td>{item.orderCount}</td>
              <td className="revenue-cell">{formatCurrency(item.revenue)}</td>
              <td>
                <div className="contribution-bar-wrapper">
                  <div className="contribution-bar" style={{ width: `${item.contribution}%` }}></div>
                  <span>{item.contribution}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopItemsEarnings;
