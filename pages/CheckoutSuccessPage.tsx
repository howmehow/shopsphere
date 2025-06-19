
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Button from '../components/Button';
import { CheckCircleIcon, HomeIcon } from '@heroicons/react/24/solid';

const CheckoutSuccessPage: React.FC = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    
    clearCart();
  }, [clearCart]);

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-250px)] py-12 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-8 rounded-xl shadow-2xl">
      <CheckCircleIcon className="w-28 h-28 text-green-500 mb-8 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-gray-800 mb-5">Zakup potwierdzony!</h1>
      <p className="text-gray-600 text-lg mb-10 max-w-md leading-relaxed">
        Skontaktujemy się z Tobą przez mail'a jeżeli chodzi o płatność i adres przesyłki!
      </p>
      <Link to="/">
        <Button variant="success" size="xl" leftIcon={<HomeIcon className="w-6 h-6"/>}>
          Kontynuuj zakupy
        </Button>
      </Link>
      <p className="text-xs text-gray-400 mt-12">
        ShopSphere
      </p>
    </div>
  );
};

export default CheckoutSuccessPage;
