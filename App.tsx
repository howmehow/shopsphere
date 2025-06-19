
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage'; // Import EditProductPage
import ChatPage from './pages/ChatPage';
import CartPage from './pages/CartPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'seller') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <CartProvider>
          <HashRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <main className="flex-grow container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:productId" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/seller/dashboard" 
                    element={
                      <ProtectedRoute>
                        <SellerDashboardPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/add-product" 
                    element={
                      <ProtectedRoute>
                        <AddProductPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seller/edit-product/:productId" 
                    element={
                      <ProtectedRoute>
                        <EditProductPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                  <Route path="/chat/:chatId" element={<ChatPage />} />
                </Routes>
              </main>
              <footer className="bg-slate-800 text-slate-200 text-center p-6 mt-auto">
                © {new Date().getFullYear()} ShopSphere. All rights reserved.
              </footer>
            </div>
          </HashRouter>
        </CartProvider>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
