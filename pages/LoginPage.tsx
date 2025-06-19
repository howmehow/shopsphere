
import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { UserCircleIcon, LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'; 
import { ShoppingBagIcon } from '@heroicons/react/24/solid';


const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState('');
  const { login, isLoading: authLoading } = useAuth(); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/seller/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = await login(username, password);
    setIsSubmitting(false);
    if (success) {
      navigate("/", { replace: true });
    } else {
      setError('Invalid username or password.');
    }
  };

  const currentIsLoading = authLoading || isSubmitting;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-250px)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10 bg-white p-8 sm:p-12 rounded-xl shadow-2xl">
        <div className="text-center">
            <RouterLink to="/" className="inline-block mb-6">
                <ShoppingBagIcon className="h-16 w-16 text-indigo-600 hover:text-indigo-700 transition-colors" />
            </RouterLink>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Account Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your dashboard to manage products and connect with customers.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. SuperStore"
            leftIcon={<UserCircleIcon />}
            disabled={currentIsLoading}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter any password"
            leftIcon={<LockClosedIcon />}
            disabled={currentIsLoading}
          />
          
          {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</p>}

          <div>
            <Button 
                type="submit" 
                isFullWidth 
                isLoading={currentIsLoading} 
                disabled={currentIsLoading}
                size="lg"
                rightIcon={<ArrowRightOnRectangleIcon className="w-5 h-5"/>}
            >
              Sign In
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Not a seller? <RouterLink to="/" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
            Continue Shopping
          </RouterLink>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;