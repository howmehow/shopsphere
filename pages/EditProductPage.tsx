
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input, { Textarea } from '../components/Input';
import { generateProductDescriptionJson } from '../services/geminiService';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon, SparklesIcon, CheckCircleIcon, ExclamationCircleIcon, PhotoIcon, TagIcon, CurrencyDollarIcon, SquaresPlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, updateProduct, isLoadingProducts } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [initialProduct, setInitialProduct] = useState<Product | null | undefined>(undefined);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0] || '');
  const [keywords, setKeywords] = useState(''); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  const placeholderImageRegex = /https:\/\/picsum\.photos\/seed\//;

  useEffect(() => {
    if (productId) {
      setPageLoading(true);
      const product = getProductById(productId);
      setInitialProduct(product);
      if (product) {
        if (user && product.sellerId !== user.id) {
            setError("You are not authorized to edit this product.");
            setInitialProduct(null); 
        } else {
            setName(product.name);
            setDescription(product.description);
            setPrice(product.price.toString());
            
            setImageUrl(placeholderImageRegex.test(product.imageUrl) ? '' : product.imageUrl);
            setCategory(product.category);
            setKeywords(''); 
        }
      }
      setPageLoading(false);
    } else {
      setError("No product ID provided.");
      setPageLoading(false);
    }
  }, [productId, getProductById, user]);

  const handleGenerateDescription = async () => {
    if (!name.trim() && !keywords.trim()) {
      setError('Please provide a product name or some keywords to generate a description.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsGeneratingDesc(true);
    try {
      const result = await generateProductDescriptionJson(name, keywords, category);
      if (result && result.description) {
        setDescription(result.description);
        if (result.description.toLowerCase().includes("invalid api key") || result.description.toLowerCase().includes("permission denied")) {
            setError("AI Description Error: Invalid API Key or insufficient permissions. Please check your Gemini API configuration. Using fallback description.");
            setSuccessMessage('');
        } else if (result.description.toLowerCase().startsWith("error") || result.description.toLowerCase().includes("failed to generate")) {
            setError("AI Description Error: Could not generate a suitable description. Please try refining keywords or write one manually.");
            setSuccessMessage('');
        } else {
            setSuccessMessage("AI description generated successfully!");
        }
      } else {
        setError('Could not generate description. The AI service might be unavailable or returned an empty response. Please try again or write one manually.');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred while generating the description. Check console for details.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!productId){
        setError("Product ID is missing. Cannot update.");
        return;
    }

    if (!name.trim() || !description.trim() || !price.trim() || !category.trim()) {
      setError('Please fill in all required fields: Name, Description, Price, and Category.');
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid positive price (e.g., 19.99).');
      return;
    }
    if (imageUrl.trim() && !imageUrl.match(/^https?:\/\/.+\..+/)) {
        setError('Please enter a valid Image URL (e.g., http://example.com/image.png) or leave it blank for a placeholder.');
        return;
    }

    setIsSubmitting(true);
    const productData: Omit<Product, 'id' | 'sellerId' | 'sellerName'> = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      imageUrl: imageUrl.trim() || `https://picsum.photos/seed/${name.trim().replace(/\s+/g, '-')}/600/400`,
      category,
    };

    const updatedProduct = await updateProduct(productId, productData);
    
    if (updatedProduct) {
      setSuccessMessage(`Product "${updatedProduct.name}" updated successfully! Redirecting to dashboard...`);
      setInitialProduct(updatedProduct); 
      setError(''); 
      setTimeout(() => navigate('/seller/dashboard'), 2500);
    } else {
      setError('Failed to update product. This might be a server issue, an invalid input, or you might not own this product. Please try again.');
      setIsSubmitting(false); 
    }
  };

  if (pageLoading || (isLoadingProducts && initialProduct === undefined)) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner size="xl" /></div>;
  }

  if (!initialProduct && !error) { 
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-2xl text-center">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you are trying to edit (ID: {productId}) could not be found.</p>
        <Link to="/seller/dashboard">
          <Button variant="primary">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto bg-white p-8 md:p-10 rounded-xl shadow-2xl">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-4 !p-2" aria-label="Go back">
            <ArrowLeftIcon className="h-5 w-5"/>
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Edytuj produkt: <span className="text-indigo-600">{initialProduct?.name || 'Item'}</span></h1>
      </div>

      {successMessage && !error && (
        <div className="mb-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg flex items-center" role="alert">
            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-600"/> 
            {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg flex items-center" role="alert">
            <ExclamationCircleIcon className="h-6 w-6 mr-3 text-red-600"/>
            {error}
        </div>
      )}
      
      {initialProduct && !error.includes("authorized") && !error.includes("No product ID") && (
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Nazwa produktu*" name="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Premium Wireless Headphones" leftIcon={<TagIcon />} />
        
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-3">
            <Input 
                label="Słowa klucze dla AI opisu (opcjonalne)"
                name="keywords" 
                value={keywords} 
                onChange={(e) => setKeywords(e.target.value)} 
                placeholder="e.g., noise-cancelling, bluetooth 5.0, żywotność baterii"
                wrapperClassName="mb-0"
                leftIcon={<SparklesIcon />}
            />
            <Button 
                type="button" 
                onClick={handleGenerateDescription} 
                isLoading={isGeneratingDesc} 
                disabled={isGeneratingDesc || (!name.trim() && !keywords.trim())} 
                variant="secondary" 
                size="md"
                leftIcon={<SparklesIcon className="h-5 w-5"/>}
                className="w-full sm:w-auto"
            >
                {isGeneratingDesc ? 'Generujemy Magię...' : 'Stwórz opis z AI'}
            </Button>
            <p className="text-xs text-indigo-700">
              Tip: Podaj nazwę produktu i specyfikację żeby opis był lepszy.
            </p>
        </div>

        <Textarea label="Opis*" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Opisz swój produkt w jak największej ilości detali..." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <Input label="Cena (PLN)*" name="price" type="number" step="0.01" min="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="e.g. 79.99" leftIcon={<CurrencyDollarIcon />} />
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">Category*</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SquaresPlusIcon className="h-5 w-5 text-gray-400"/>
                </div>
                <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="pl-10 block w-full py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-150 ease-in-out"
                >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
          </div>
        </div>
        
        <Input label="Image URL (Optional)" name="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg (leave blank for placeholder)" leftIcon={<PhotoIcon />} />
        <p className="text-xs text-gray-500 -mt-2">Jeżeli będzie brakować zdjęcia to pokażemy randomowy obrazek z internetu.</p>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={() => navigate('/seller/dashboard')} disabled={isSubmitting || isGeneratingDesc}>
            Anuluj
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || isGeneratingDesc} size="lg">
            {isSubmitting ? 'Zapisywanie zmian...' : 'Zapisz'}
          </Button>
        </div>
      </form>
      )}
      { (error.includes("authorized") || error.includes("No product ID")) && !successMessage && (
          <div className="text-center mt-6">
               <Link to="/seller/dashboard">
                    <Button variant="primary">Wróć do strony głównej</Button>
                </Link>
          </div>
      )}
    </div>
  );
};

export default EditProductPage;
