import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './VendorShell.css';

const VendorShell = ({ children, title }) => {
  return (
    <div className="grid-layout">
      <Sidebar />
      <main className="main-content">
        <TopBar title={title} />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VendorShell;
