import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Utensils, IndianRupee, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';
import './Sidebar.css';

const Sidebar = () => {
  const { logout, profile, shop } = useAuth();

  const navItems = [
    { name: 'Live Orders', path: '/live-orders', icon: <LayoutDashboard size={20} /> },
    { name: 'History', path: '/past-orders', icon: <History size={20} /> },
    { name: 'Menu', path: '/menu', icon: <Utensils size={20} /> },
    { name: 'Earnings', path: '/earnings', icon: <IndianRupee size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Utensils className="logo-icon" size={24} />
          <span className="logo-text">VendorPanel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="vendor-info">
          <p className="vendor-name">{profile?.full_name || 'Vendor'}</p>
          <p className="shop-name">{shop?.name || 'Assigned Shop'}</p>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
