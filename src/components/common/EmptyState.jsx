import React from 'react';
import { Package } from 'lucide-react';
import './EmptyState.css';

const EmptyState = ({ title, message, icon: Icon = Package }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon-wrapper">
        <Icon size={48} className="empty-icon" />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
