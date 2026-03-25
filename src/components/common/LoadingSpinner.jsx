import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 40, color = 'var(--accent)' }) => {
  return (
    <div className="spinner-container">
      <div 
        className="spinner" 
        style={{ 
          width: size, 
          height: size, 
          borderTopColor: color 
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
