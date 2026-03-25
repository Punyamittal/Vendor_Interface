import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import Login from './auth/Login';
import LiveOrders from './pages/LiveOrders';
import PastOrders from './pages/PastOrders';
import MenuManagement from './pages/MenuManagement';
import Earnings from './pages/Earnings';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/live-orders" replace />
            </ProtectedRoute>
          } />

          <Route path="/live-orders" element={
            <ProtectedRoute>
              <LiveOrders />
            </ProtectedRoute>
          } />

          <Route path="/past-orders" element={
            <ProtectedRoute>
              <PastOrders />
            </ProtectedRoute>
          } />

          <Route path="/menu" element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          } />

          <Route path="/earnings" element={
            <ProtectedRoute>
              <Earnings />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/live-orders" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
