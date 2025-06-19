
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { TagIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block overflow-hidden h-60">
        <img 
          src={product.imageUrl || 'https://picsum.photos/400/300?random=' + product.id} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out" 
        />
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                {product.category}
            </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors" title={product.name}>
          <Link to={`/product/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-500 text-xs mb-3">Sold by: <span className="font-medium text-gray-700">{product.sellerName}</span></p>
        
        <div className="mt-auto">
            <p className="text-indigo-600 font-bold text-2xl mb-4">{product.price.toFixed(2)} PLN</p>
            <Link
              to={`/product/${product.id}`}
              className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150 inline-flex items-center justify-center group"
            >
             <ShoppingCartIcon className="h-5 w-5 mr-2 group-hover:animate-bounce- rövid"/>
              Pokaż szczegóły
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;