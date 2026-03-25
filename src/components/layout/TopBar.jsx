import React, { useState, useEffect } from 'react';
import { Bell, ShoppingBag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { shopService } from '../../services/shopService';
import { supabase } from '../../lib/supabaseClient';
import './TopBar.css';

const TopBar = ({ title }) => {
  const { vendor, shopId } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (shopId) {
      shopService.getShopData(shopId).then(({ data }) => {
        if (data) setIsOnline(data.is_accepting_orders);
      });

      // Optional: Listen for shop status changes from other sources/tabs
      const channel = supabase.channel(`shop-status-${shopId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'shops', 
          filter: `id=eq.${shopId}` 
        }, payload => {
          setIsOnline(payload.new.is_accepting_orders);
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
  }, [shopId]);

  const handleToggle = async () => {
    const error = await shopService.toggleShopAcceptingOrders(shopId, isOnline);
    if (!error) setIsOnline(!isOnline);
  };

  return (
    <header className="top-bar glass-effect">
      <div className="top-bar-left">
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="top-bar-right">
        <div className="shop-status-toggle" onClick={handleToggle}>
          <span className={`status-label ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Shop Online' : 'Shop Offline'}
          </span>
          {isOnline ? (
            <ToggleRight className="toggle-icon online" size={32} />
          ) : (
            <ToggleLeft className="toggle-icon offline" size={32} />
          )}
        </div>

        <button className="icon-btn">
          <Bell size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="user-profile">
          <div className="avatar">
            {vendor?.full_name?.charAt(0) || 'V'}
          </div>
          <div className="user-details">
            <p className="user-name">{vendor?.full_name}</p>
            <p className="user-role">Vendor</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
