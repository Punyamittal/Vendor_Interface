import React from 'react';
import { Bell, ToggleLeft, ToggleRight, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { shopService } from '../../services/shopService';
import './TopBar.css';

const TopBar = ({ title, onMenuClick }) => {
  const { profile: vendor, shop, shopId, applyShopPatch } = useAuth();
  const isOnline = !!shop?.is_accepting_orders;

  const handleToggle = async () => {
    if (!shopId) {
      toast.error('No shop is assigned to this account.');
      return;
    }
    const previous = isOnline;
    applyShopPatch({ is_accepting_orders: !previous });
    const { data, error } = await shopService.toggleShopAcceptingOrders(shopId, previous);
    if (error) {
      applyShopPatch({ is_accepting_orders: previous });
      toast.error(error.message || 'Could not update shop status. Check permissions or try again.');
      return;
    }
    if (data && typeof data.is_accepting_orders === 'boolean') {
      applyShopPatch({ is_accepting_orders: data.is_accepting_orders });
    }
  };

  return (
    <header className="top-bar glass-effect">
      <div className="top-bar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="top-bar-right">
        <div className="shop-status-toggle" onClick={handleToggle}>
          <span className={`status-label ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Shop' : 'Offline'}
          </span>
          {isOnline ? (
            <ToggleRight className="toggle-icon online" size={28} />
          ) : (
            <ToggleLeft className="toggle-icon offline" size={28} />
          )}
        </div>

        <button className="icon-btn hide-mobile">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            {vendor?.full_name?.charAt(0) || 'V'}
          </div>
          <div className="user-details hide-mobile">
            <p className="user-name">{vendor?.full_name}</p>
            <p className="user-role">Vendor</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
