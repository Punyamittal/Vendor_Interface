import React, { useEffect } from 'react';
import VendorShell from '../components/layout/VendorShell';
import LiveOrderCard from '../components/orders/LiveOrderCard';
import EmptyState from '../components/common/EmptyState';
import { ShoppingBag, Power } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLiveOrders } from '../hooks/useLiveOrders';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import './LiveOrders.css';

const LiveOrders = () => {
  const { shopId, shop } = useAuth();
  const acceptingOrders = shop?.is_accepting_orders !== false;
  const { liveOrders, completedToday, loading, refetch } = useLiveOrders(shopId);

  const pendingOrders = liveOrders.filter(o => o.status === 'pending');
  const acceptedOrders = liveOrders.filter(o => o.status === 'accepted');

  const totalEarningsToday = completedToday.reduce((sum, order) => sum + order.total_amount, 0);

  const handleUpdateStatus = async (orderId, action) => {
    let error;
    if (action === 'accept') error = await orderService.acceptOrder(orderId);
    if (action === 'reject') error = await orderService.rejectOrder(orderId);
    if (action === 'complete') error = await orderService.completeOrder(orderId);

    if (error) toast.error(error.message);
    else toast.success(`Order ${action}ed successfully`);
  };

  return (
    <VendorShell title="Live Orders">
      <div className="live-orders-layout">
        <div className="main-column">
          {!acceptingOrders && (
            <div className="offline-shop-banner" role="status">
              <Power size={18} aria-hidden />
              <div className="offline-shop-banner__text">
                <strong>Store is offline</strong>
                <span>New orders from customers are paused. Turn the shop on from the header when you are ready.</span>
              </div>
            </div>
          )}
          <div className="orders-summary-bar">
            {/* ... JSX remains similar, but using liveOrders and pendingOrders lengths ... */}
            <div className="summary-card">
              <div className="pulsing-dot-container">
                <div className="pulsing-dot"></div>
                <span>LIVE</span>
              </div>
              <p className="summary-value">{liveOrders.length} Active</p>
            </div>
            
            <div className="summary-card">
              <ShoppingBag size={18} className="text-muted" />
              <p className="summary-value">{pendingOrders.length} Pending</p>
            </div>
          </div>

          <div className="orders-sections">
            <section className="order-section">
              <h2 className="section-title">New Orders ({pendingOrders.length})</h2>
              {pendingOrders.length === 0 ? (
                <div className="empty-section">
                  <EmptyState 
                    title="No new orders" 
                    message="New orders will appear here automatically." 
                  />
                </div>
              ) : (
                <div className="orders-grid">
                  {pendingOrders.map(order => (
                    <LiveOrderCard 
                      key={order.id} 
                      order={{...order, customerName: order.student?.full_name || 'Generic Student'}} 
                      onAccept={() => handleUpdateStatus(order.id, 'accept')}
                      onReject={() => handleUpdateStatus(order.id, 'reject')}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="order-section">
              <h2 className="section-title">In Preparation ({acceptedOrders.length})</h2>
              {acceptedOrders.length === 0 ? (
                <div className="empty-section">
                  <p>No orders in preparation right now.</p>
                </div>
              ) : (
                <div className="orders-grid">
                  {acceptedOrders.map(order => (
                    <LiveOrderCard 
                      key={order.id} 
                      order={{...order, customerName: order.student?.full_name || 'Generic Student'}} 
                      onComplete={() => handleUpdateStatus(order.id, 'complete')}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        <aside className="side-column">
          <div className="completed-summary glass-effect">
            <div className="aside-header">
              <h3>Completed Today</h3>
              <span className="count-badge">{completedToday.length}</span>
            </div>
            
            <div className="total-revenue-summary">
              <p className="label">Total Generated</p>
              <h2 className="amount">{formatCurrency(totalEarningsToday)}</h2>
            </div>
            {/* ... Completed List section ... */}
          </div>
        </aside>
      </div>
    </VendorShell>
  );
};

export default LiveOrders;
