
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Product } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusCircleIcon, EyeIcon, PencilSquareIcon, TrashIcon, ChatBubbleLeftRightIcon, PresentationChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SellerProductRowProps {
  product: Product;
  index: number;
}

const SellerProductRow: React.FC<SellerProductRowProps> = ({ product, index }) => {
  return (
    <tr className={`transition-colors duration-150 ${index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <img className="h-12 w-12 rounded-md object-cover" src={product.imageUrl || `https://picsum.photos/seed/${product.id}/50`} alt={product.name} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={product.name}>{product.name}</div>
            <div className="text-xs text-gray-500">{product.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{product.price.toFixed(2)} PLN</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <Link to={`/product/${product.id}`} className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-100 transition-colors inline-flex items-center" title="View Product">
            <EyeIcon className="h-5 w-5"/>
        </Link>
        <Link to={`/seller/edit-product/${product.id}`} className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-md hover:bg-yellow-100 transition-colors inline-flex items-center" title="Edit Product">
            <PencilSquareIcon className="h-5 w-5"/>
        </Link>
        <button onClick={() => alert('Delete feature coming soon!')} className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors inline-flex items-center" title="Delete Product">
            <TrashIcon className="h-5 w-5"/>
        </button>
      </td>
    </tr>
  );
}


const SellerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { products, isLoadingProducts } = useData();

  
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white p-8 rounded-lg shadow-xl">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">Please log in as a seller to view this page.</p>
            <Link to="/login"><Button>Go to Login</Button></Link>
        </div>
    );
  }

  const sellerProducts = products.filter(p => p.sellerId === user.id);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
        <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.username}!</h1>
            <p className="text-indigo-100 mt-1">Manage your shop and connect with customers.</p>
        </div>
        <Link to="/seller/add-product" className="mt-4 sm:mt-0">
          <Button variant="secondary" size="lg" leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>Add New Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white p-6 rounded-xl shadow-xl col-span-1 md:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <PresentationChartBarIcon className="h-7 w-7 mr-2 text-indigo-600"/>
                    Your Product Listings ({sellerProducts.length})
                </h2>
                {sellerProducts.length > 5 && ( 
                     <Link to="/seller/add-product">
                        <Button size="sm" leftIcon={<PlusCircleIcon className="h-4 w-4"/>}>Add Product</Button>
                    </Link>
                )}
            </div>
            {isLoadingProducts && sellerProducts.length === 0 ? (
            <div className="py-10"><LoadingSpinner size="lg" /></div>
            ) : sellerProducts.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sellerProducts.map((product, index) => (
                    <SellerProductRow key={product.id} product={product} index={index} />
                    ))}
                </tbody>
                </table>
            </div>
            ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <PresentationChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                <p className="text-xl font-medium text-gray-700 mb-2">No products yet!</p>
                <p className="text-gray-500 mb-6">Start selling by adding your first product.</p>
                <Link to="/seller/add-product">
                    <Button leftIcon={<PlusCircleIcon className="h-5 w-5"/>}>Add Your First Product</Button>
                </Link>
            </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-7 w-7 mr-2 text-indigo-600"/>
                Customer Messages
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto text-gray-400 mb-4"/>
                <p className="text-lg font-medium text-gray-700 mb-2">Real-time Chat Coming Soon!</p>
                <p className="text-gray-500 mb-4">This section will display your conversations with customers.</p>
                <Link to="/chat/seller-inbox-preview">
                    <Button variant="ghost" size="sm">View Chat System Preview</Button>
                </Link>
            </div>
        </div>

        
        <div className="bg-white p-6 rounded-xl shadow-xl">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-7 w-7 mr-2 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Sales Analytics
            </h2>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-16 w-16 mx-auto text-gray-400 mb-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                </svg>
                <p className="text-lg font-medium text-gray-700 mb-2">Performance Metrics Coming Soon!</p>
                <p className="text-gray-500">Track your sales, views, and top products here.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardPage;
