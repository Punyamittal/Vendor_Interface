import React from 'react';
import './MenuGrid.css';

const MenuGrid = ({ children }) => {
  return (
    <div className="menu-grid">
      {children}
    </div>
  );
};

export default MenuGrid;
