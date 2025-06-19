
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Button from '../components/Button';
import { TrashIcon, ShoppingCartIcon, ArrowLeftIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../types';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartItemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    } else if (newQuantity === 0) { 
      updateQuantity(productId, 0); 
    }
  };
  
  const handleCheckout = () => {
    
    navigate('/checkout-success');
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-white p-10 rounded-xl shadow-lg">
        <ShoppingCartIcon className="w-24 h-24 mx-auto text-gray-300 mb-6" />
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 text-lg">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/">
          <Button size="lg" variant="primary" leftIcon={<ArrowLeftIcon className="h-5 w-5"/>}>
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart ({getCartItemCount()} items)</h1>
        {cartItems.length > 0 && (
            <Button variant="danger" size="sm" onClick={() => { if(window.confirm('Are you sure you want to empty your cart?')) clearCart();}} leftIcon={<TrashIcon className="h-4 w-4"/>} className="mt-4 sm:mt-0">
                Empty Cart
            </Button>
        )}
      </div>

      <div className="space-y-6 mb-10">
        {cartItems.map((item: CartItem) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
              <img 
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/100`} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-md mr-4 flex-shrink-0" 
              />
              <div className="flex-grow">
                <Link to={`/product/${item.id}`} className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors block">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">Cena jednostkowa: {item.price.toFixed(2)} PLN </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center border border-gray-300 rounded-md">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleQuantityChange(item.id, item.quantity, -1)} 
                    className="!p-2 !rounded-r-none !border-r !border-gray-300"
                    aria-label={`Decrease quantity of ${item.name}`}
                    disabled={item.quantity <=1}
                >
                    <MinusIcon className="h-4 w-4" />
                </Button>
                <input 
                    type="number" 
                    value={item.quantity} 
                    readOnly 
                    className="w-12 text-center border-0 focus:ring-0 text-sm font-medium"
                    aria-label={`Quantity for ${item.name}`}
                />
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleQuantityChange(item.id, item.quantity, 1)} 
                    className="!p-2 !rounded-l-none !border-l !border-gray-300"
                    aria-label={`Increase quantity of ${item.name}`}
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-md font-semibold text-gray-800 w-20 text-right">{(item.price * item.quantity).toFixed(2)} PLN</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => removeFromCart(item.id)} 
                className="!p-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                title={`Remove ${item.name} from cart`}
                aria-label={`Remove ${item.name} from cart`}
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="flex justify-end space-x-6 items-center">
            <div className="text-right">
                <p className="text-lg text-gray-600">Subtotal ({getCartItemCount()} items):</p>
                <p className="text-3xl font-bold text-gray-900">{getCartTotal().toFixed(2)} PLN</p>
                <p className="text-xs text-gray-500 mt-1">Koszt dostawy będzie dodany po zakupie.</p>
            </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
           <Link to="/" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" leftIcon={<ArrowLeftIcon className="h-5 w-5"/>} isFullWidth={window.innerWidth < 640}>
                    Continue Shopping
                </Button>
            </Link>
            <Button onClick={handleCheckout} size="xl" isFullWidth={window.innerWidth < 640} className="w-full sm:w-auto">
                Proceed to Checkout
            </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
