import React from 'react';
import { Edit2, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import './MenuItemCard.css';

const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const categoryLabel =
    typeof item?.category === 'string'
      ? item.category
      : item?.category?.name || item?.category_info?.name || '';

  return (
    <div className={`menu-item-card ${!item.isAvailable ? 'unavailable' : ''}`}>
      <div className="item-image-placeholder">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <div className="emoji-icon">🍔</div>
        )}
      </div>

      <div className="item-details">
        <div className="item-header">
          <h3>{item.name}</h3>
          <span className="item-category">{categoryLabel}</span>
        </div>
        
        <p className="item-description">{item.description}</p>
        
        <div className="item-price-row">
          <span className="price">{formatCurrency(item.price)}</span>
          <div className="availability-switch" onClick={() => onToggleAvailability(item.id, !item.isAvailable)}>
            <div className={`switch-track ${item.isAvailable ? 'on' : 'off'}`}>
              <div className="switch-thumb"></div>
            </div>
            <span className="switch-label">{item.isAvailable ? 'Available' : 'Sold Out'}</span>
          </div>
        </div>

        <div className="item-actions">
          <button className="btn-edit" onClick={() => onEdit(item)}>
            <Edit2 size={16} />
            <span>Edit</span>
          </button>
          <button className="btn-delete" onClick={() => onDelete(item.id)}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
