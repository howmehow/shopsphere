
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBagIcon as AppIcon, UserCircleIcon, CogIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const cartItemCount = getCartItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold hover:opacity-90 transition-opacity">
              <AppIcon className="h-8 w-8" />
              <span>ShopSphere</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Home</NavLink>
            {user && user.role === 'seller' && (
              <NavLink to="/seller/dashboard">Panel sprzedawcy</NavLink>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 rounded-full text-indigo-200 hover:text-white hover:bg-indigo-700 transition-colors">
              <ShoppingCartIcon className="h-7 w-7" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
              <span className="sr-only">Pokaż koszyk</span>
            </Link>
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-7 w-7 text-indigo-200" />
                  <span className="font-medium">Witaj, {user.username}!</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Wyloguj"
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  <span>Wyloguj</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 transform hover:scale-105"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link 
    to={to} 
    className="px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors duration-150"
  >
    {children}
  </Link>
);

export default Navbar;