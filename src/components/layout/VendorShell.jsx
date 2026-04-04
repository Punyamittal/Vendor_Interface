import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './VendorShell.css';

const VendorShell = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`grid-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Toaster position="top-right" />
      <div 
        className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <main className="main-content">
        <TopBar title={title} onMenuClick={toggleSidebar} />
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VendorShell;
