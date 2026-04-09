import React, { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

const Login = lazy(() => import('./auth/Login'));
const LiveOrders = lazy(() => import('./pages/LiveOrders'));
const PastOrders = lazy(() => import('./pages/PastOrders'));
const MenuManagement = lazy(() => import('./pages/MenuManagement'));
const Earnings = lazy(() => import('./pages/Earnings'));

/** Hash routes work on any static host without server rewrites (URLs look like /#/live-orders). */
const useHashRouter = import.meta.env.VITE_HASH_ROUTER === 'true';
const Router = useHashRouter ? HashRouter : BrowserRouter;

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

function App() {
  return (
    <AuthProvider>
      <Router basename={routerBasename}>
        <Suspense
          fallback={
            <div className="full-page-center">
              <LoadingSpinner />
            </div>
          }
        >
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
