import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Customer pages
import HomePage from './pages/customer/HomePage';
import MenuPage from './pages/customer/MenuPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import AccountPage from './pages/customer/AccountPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import DashboardHomePage from './pages/admin/DashboardHomePage';
import OrdersPage from './pages/admin/OrdersPage';
import MenuManagerPage from './pages/admin/MenuManagerPage';
import ShopSettingsPage from './pages/admin/ShopSettingsPage';
import DashboardLayout from './pages/admin/DashboardLayout';

// Layout components
import Navbar from './components/customer/Navbar';
import CartDrawer from './components/customer/CartDrawer';

function CustomerLayout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background dark:bg-[#0d0c0c] text-on-background dark:text-zinc-100 font-body transition-colors duration-300">
        <Routes>
          {/* Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route index path="/admin" element={<DashboardHomePage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/menu" element={<MenuManagerPage />} />
            <Route path="/admin/settings" element={<ShopSettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
