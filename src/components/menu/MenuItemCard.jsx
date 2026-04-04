import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import './MenuItemCard.css';

const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const categoryLabel =
    typeof item?.category === 'string'
      ? item.category
      : item?.category?.name || item?.category_info?.name || '';

  const available = item.isAvailable;

  return (
    <div className={`menu-item-card${!available ? ' menu-item-card--unavailable' : ''}`}>
      <div className="item-image-wrapper">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className={!available ? 'item-image--muted' : undefined}
          />
        ) : (
          <div className="item-image-placeholder" aria-hidden>
            🍔
          </div>
        )}

        {categoryLabel && (
          <div className="item-category-badge">{categoryLabel}</div>
        )}

        {!available && (
          <div className="item-unavailable-overlay">
            <div className="item-unavailable-pill">
              <AlertCircle size={14} className="item-unavailable-icon" aria-hidden />
              <span>Out of stock</span>
            </div>
          </div>
        )}
      </div>

      <div className="item-body">
        <h3 className="item-title">{item.name}</h3>
        <p className="item-description">
          {item.description || 'Quick and delicious daily special.'}
        </p>

        <div className="item-footer">
          <div className="price-row">
            <span className="price">{formatCurrency(item.price)}</span>
            <button
              type="button"
              className={`item-active-toggle ${available ? 'active' : ''}`}
              onClick={() => onToggleAvailability(item.id, !available)}
              aria-pressed={available}
              aria-label={available ? 'Mark item hidden' : 'Mark item active'}
            >
              <span className="toggle-switch" aria-hidden>
                <span className="toggle-knob" />
              </span>
              <span className="toggle-text">{available ? 'Active' : 'Hidden'}</span>
            </button>
          </div>

          <div className="action-buttons">
            <button type="button" onClick={() => onEdit(item)} className="btn-card">
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button type="button" onClick={() => onDelete(item.id)} className="btn-card btn-delete">
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
