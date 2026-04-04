import React from 'react';
import './MenuCardStyles.css';

const MenuGrid = ({ children }) => {
  return (
    <div className="menu-grid-css">
      {children}
    </div>
  );
};

export default MenuGrid;
