import React from 'react';
import { Clock, User } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelativeTime } from '../../utils/formatTime';
import './LiveOrderCard.css';

const LiveOrderCard = ({ order, onAccept, onReject, onComplete }) => {
  const isPending = order.status === 'pending';
  const isAccepted = order.status === 'accepted';
  const lineItems = order.order_items ?? order.items ?? [];
  const createdAt = order.created_at ?? order.createdAt;
  const total =
    order.total_amount != null ? order.total_amount : order.totalAmount;

  return (
    <div className={`live-order-card ${order.status}`}>
      <div className="card-header">
        <div className="order-id">
          <span>Order #{order.id.slice(-4).toUpperCase()}</span>
          {isPending && <div className="pulsing-dot"></div>}
        </div>
        <div className="order-timer">
          <Clock size={14} />
          <span>{formatRelativeTime(createdAt)}</span>
        </div>
      </div>

      <div className="customer-info">
        <User size={16} />
        <span>{order.customerName}</span>
      </div>

      <div className="order-items">
        {lineItems.map((item, idx) => {
          const name = item.menu_item?.name ?? item.name ?? 'Item';
          const unitPrice = Number(
            item.unit_price ?? item.price_at_order ?? item.price ?? 0
          );
          const qty = Number(item.quantity ?? 1);
          return (
            <div key={item.id ?? idx} className="item-row">
              <span className="item-qty">{qty}x</span>
              <span className="item-name">{name}</span>
              <span className="item-price">
                {formatCurrency(unitPrice * qty)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="card-footer">
        <div className="order-total">
          <span className="label">Total</span>
          <span className="amount">{formatCurrency(total)}</span>
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
