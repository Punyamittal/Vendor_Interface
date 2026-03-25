import React, { useEffect, useState } from 'react';
import VendorShell from '../components/layout/VendorShell';
import EmptyState from '../components/common/EmptyState';
import { Search, Calendar, Download, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import { formatTime } from '../utils/formatTime';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PastOrders.css';

const PastOrders = () => {
  const { shopId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (shopId) fetchOrders();
  }, [shopId, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getPastOrders(shopId, { status: statusFilter });
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch past orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderIdToMatch = order.id.toLowerCase();
    const studentToMatch = (order.student?.full_name || '').toLowerCase();
    const searchToMatch = searchTerm.toLowerCase();
    
    return orderIdToMatch.includes(searchToMatch) || studentToMatch.includes(searchToMatch);
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <VendorShell title="Order History">
      <div className="history-header-actions">
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button className="export-btn">
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="revenue-summary-row glass-effect">
        <p>Showing <strong>{filteredOrders.length} orders</strong></p>
        <p>Total Revenue: <strong>{formatCurrency(totalRevenue)}</strong></p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filteredOrders.length === 0 ? (
        <EmptyState title="No orders found" message="Try adjusting your filters or search." />
      ) : (
        <div className="table-container glass-effect">
          <table className="history-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Student</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id-cell">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="student-cell">{order.student?.full_name || 'Generic Student'}</td>
                  <td className="items-cell">{order.order_items?.length || 0} items</td>
                  <td className="total-cell">{formatCurrency(order.total_amount)}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatTime(order.created_at)}
                  </td>
                  <td>
                    <button className="view-btn"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </VendorShell>
  );
};

export default PastOrders;
