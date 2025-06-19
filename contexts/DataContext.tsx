import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Product, Review } from '../types';
import { API_BASE_URL } from '../constants';
import { useAuth } from './AuthContext';

interface DataContextType {
  products: Product[];
  reviews: Review[];
  getProducts: () => Product[];
  getProductById: (id: string) => Product | undefined;
  getReviewsByProductId: (productId: string) => Review[];
  addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName'>) => Promise<Product | null>;
  updateProduct: (productId: string, productData: Omit<Product, 'id' | 'sellerId' | 'sellerName'>) => Promise<Product | null>;
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => Promise<Review | null>;
  isLoadingProducts: boolean;
  isLoadingReviews: boolean;
  refreshProducts: () => Promise<void>;
  refreshReviews: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const { user, token } = useAuth();

  
  const makeAuthenticatedRequest = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [token]);

  
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const data = await makeAuthenticatedRequest(`${API_BASE_URL}/public/products`);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [makeAuthenticatedRequest]);

  
  const fetchReviews = useCallback(async () => {
    try {
      setIsLoadingReviews(true);
      
      const response = await fetch(`${API_BASE_URL}/public/reviews`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, [makeAuthenticatedRequest]);

  
  useEffect(() => {
    fetchProducts();
    fetchReviews();
  }, [fetchProducts, fetchReviews]);

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  const refreshReviews = useCallback(async () => {
    await fetchReviews();
  }, [fetchReviews]);

  const getProducts = useCallback(() => {
    return products;
  }, [products]);

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const getReviewsByProductId = useCallback((productId: string): Review[] => {
    return reviews.filter(r => r.productId === productId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName'>): Promise<Product | null> => {
    if (!user || user.role !== 'seller') {
      console.error("Only sellers can add products.");
      return null;
    }

    if (!token) {
      console.error("Authentication token required.");
      return null;
    }

    try {
      const newProduct = await makeAuthenticatedRequest(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          imageUrl: productData.imageUrl,
          category: productData.category,
        }),
      });

      
      await refreshProducts();
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }, [user, token, makeAuthenticatedRequest, refreshProducts]);

  const updateProduct = useCallback(async (
    productId: string,
    updatedProductData: Omit<Product, 'id' | 'sellerId' | 'sellerName'>
  ): Promise<Product | null> => {
    if (!user || user.role !== 'seller') {
      console.error("Operation failed: Only sellers can update products.");
      return null;
    }

    if (!token) {
      console.error("Authentication token required.");
      return null;
    }

    try {
      const updatedProduct = await makeAuthenticatedRequest(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updatedProductData.name,
          description: updatedProductData.description,
          price: updatedProductData.price,
          imageUrl: updatedProductData.imageUrl,
          category: updatedProductData.category,
        }),
      });

      
      await refreshProducts();
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }, [user, token, makeAuthenticatedRequest, refreshProducts]);

  const addReview = useCallback(async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review | null> => {
    if (!user) {
      console.error("Operation failed: Only users can add reviews.");
      return null;
    }
    if (!token) {
      console.error("Authentication token required.");
      return null;
    }


    try {
      const newReview = await makeAuthenticatedRequest(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.username,
          productId: reviewData.productId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      
      await refreshReviews();
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }, [user, token, makeAuthenticatedRequest, refreshReviews]);

  return (
    <DataContext.Provider value={{ 
      products, 
      reviews, 
      getProducts, 
      getProductById, 
      getReviewsByProductId, 
      addProduct, 
      updateProduct,
      addReview,
      isLoadingProducts,
      isLoadingReviews,
      refreshProducts,
      refreshReviews
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
