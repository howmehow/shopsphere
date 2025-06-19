
import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon,ChevronDownIcon } from '@heroicons/react/24/outline';


const HomePage: React.FC = () => {
  const { products, isLoadingProducts } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | ''>('');

  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products]; 

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.description.toLowerCase().includes(lowerSearchTerm) ||
        product.sellerName.toLowerCase().includes(lowerSearchTerm) ||
        product.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (selectedCategory) {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return tempProducts;
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (isLoadingProducts && products.length === 0) { 
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="xl" color="text-indigo-500" />
        <p className="mt-4 text-lg text-gray-600">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-12 rounded-xl shadow-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">Witamy w ShopSphere!</h1>
        <p className="text-lg md:text-xl opacity-90">Odkryj niesamowite produkty od utalentowanych sprzedawców z całego świata.</p>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
          <div className="relative col-span-1 md:col-span-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Szukaj</label>
            <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                id="search"
                placeholder="Wyszukaj produkty, sprzedawców..."
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-span-1 md:col-span-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
            <div className="relative">
                <select
                    id="category"
                    className="appearance-none w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-8 transition-shadow"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Wszystkie kategorie</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon className="h-5 w-5"/>
                </div>
            </div>
          </div>
          <div className="col-span-1 md:col-span-1">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sortuj</label>
            <div className="relative">
                <select
                    id="sort"
                    className="appearance-none w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white pr-8 transition-shadow"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                >
                    <option value="">Domyślne</option>
                    <option value="price-asc">Cena: Niska do Wysoka</option>
                    <option value="price-desc">Cena: Wysoka do Niska</option>
                    <option value="name-asc">Nazwa: A do Z</option>
                    <option value="name-desc">Nazwa: Z do A</option>
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDownIcon className="h-5 w-5"/>
                </div>
            </div>
          </div>
        </div>
      </div>

      {isLoadingProducts && products.length > 0 && (
         <div className="w-full h-1 bg-indigo-200 rounded-full overflow-hidden my-4">
            <div className="h-1 bg-indigo-500 animate-pulse w-1/3 rounded-full"></div>
        </div>
      )}

      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
          {filteredAndSortedProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        !isLoadingProducts && (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
                <AdjustmentsHorizontalIcon className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">No Products Found</h2>
                <p className="text-gray-500 text-lg">Try adjusting your search or filter criteria, or check back later!</p>
            </div>
        )
      )}
    </div>
  );
};

export default HomePage;