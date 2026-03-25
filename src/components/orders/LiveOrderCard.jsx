import React from 'react';
import { Clock, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatTime';
import './LiveOrderCard.css';

const LiveOrderCard = ({ order, onAccept, onReject, onComplete }) => {
  const isPending = order.status === 'pending';
  const isAccepted = order.status === 'accepted';

  return (
    <div className={`live-order-card ${order.status}`}>
      <div className="card-header">
        <div className="order-id">
          <span>Order #{order.id.slice(-4).toUpperCase()}</span>
          {isPending && <div className="pulsing-dot"></div>}
        </div>
        <div className="order-timer">
          <Clock size={14} />
          <span>{formatRelativeTime(order.createdAt)}</span>
        </div>
      </div>

      <div className="customer-info">
        <User size={16} />
        <span>{order.customerName}</span>
      </div>

      <div className="order-items">
        {order.items.map((item, idx) => (
          <div key={idx} className="item-row">
            <span className="item-qty">{item.quantity}x</span>
            <span className="item-name">{item.name}</span>
            <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="card-footer">
        <div className="order-total">
          <span className="label">Total</span>
          <span className="amount">{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="card-actions">
          {isPending && (
            <>
              <button 
                className="btn-reject" 
                onClick={() => onReject(order.id)}
              >
                Reject
              </button>
              <button 
                className="btn-accept" 
                onClick={() => onAccept(order.id)}
              >
                Accept
              </button>
            </>
          )}
          {isAccepted && (
            <button 
              className="btn-complete" 
              onClick={() => onComplete(order.id)}
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveOrderCard;
