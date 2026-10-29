import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Search } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';

// Public website pages
import HomePage from './pages/HomePage';
import EditionsPage from './pages/EditionsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import FAQPage from './pages/FAQPage';
import PoliciesPage from './pages/PoliciesPage';
import GuardianDashboard from './pages/guardian/GuardianDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Buyer pages
import ShopPage from './pages/buyer/ShopPage';
import MyOrdersPage from './pages/buyer/MyOrdersPage';
import DeviceDetailPage from './pages/buyer/DeviceDetailPage';

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard';
import NewSellRequest from './pages/seller/NewSellRequest';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CartDrawer />
          <WishlistDrawer />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#121417',
                color: '#f4f2ee',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#20bf6b', secondary: '#121417' } },
              error: { iconTheme: { primary: '#eb3b5a', secondary: '#121417' } },
            }}
          />

          <Routes>
            {/* Public Consumer Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/devices/:id" element={<DeviceDetailPage />} />
            <Route path="/editions" element={<EditionsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/guardian" element={<GuardianDashboard />} />
            <Route path="/sell" element={<Navigate to="/seller/new" replace />} />

            {/* Auth routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Buyer routes */}
            <Route path="/buyer/orders" element={
              <ProtectedRoute roles={['buyer']}><MyOrdersPage /></ProtectedRoute>
            } />

            {/* Seller routes */}
            <Route path="/seller" element={
              <ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>
            } />
            <Route path="/seller/new" element={
              <ProtectedRoute roles={['seller']}><NewSellRequest /></ProtectedRoute>
            } />
            <Route path="/seller/requests" element={
              <ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>
            } />
            <Route path="/seller/profile" element={
              <ProtectedRoute roles={['seller']}><SellerDashboard /></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-primary)' }}>
                <div style={{ color: 'var(--text-secondary)' }}><Search size={56} strokeWidth={1.5} /></div>
                <h1 style={{ fontSize: '2rem' }}>Page not found</h1>
                <a href="/" className="btn btn-primary">Go to VoltKart Home</a>
              </div>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
