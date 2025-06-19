
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useCart } from '../contexts/CartContext';
import { Product, Review as ReviewType } from '../types';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import Input, { Textarea } from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { StarIcon as StarIconSolid, ChatBubbleLeftEllipsisIcon, ShoppingCartIcon as CartIconHero, CheckCircleIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';


interface StarRatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({ rating, setRating, disabled = false, size = 'md' }) => {
  const starSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && setRating(star)}
          className={`focus:outline-none transition-colors duration-150 ${disabled ? 'cursor-default' : 'hover:scale-110 transform'}`}
          disabled={disabled}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          {star <= rating ? 
            <StarIconSolid className={`${starSizeClasses[size]} text-yellow-400`} /> :
            <StarIconOutline className={`${starSizeClasses[size]} text-gray-300 hover:text-yellow-300`} />
          }
        </button>
      ))}
    </div>
  );
};


const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductById, getReviewsByProductId, addReview, isLoadingProducts } = useData();
  const { addToCart, isItemInCart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [reviews, setReviews] = useState<ReviewType[]>([]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [addedToCartMessage, setAddedToCartMessage] = useState(false);


  const fetchProductAndReviews = useCallback(() => {
    if (productId) {
      const currentProduct = getProductById(productId);
      setProduct(currentProduct);
      if (currentProduct) {
        setReviews(getReviewsByProductId(productId));
      } else {
        setReviews([]);
      }
    }
  }, [productId, getProductById, getReviewsByProductId]);

  useEffect(() => {
    fetchProductAndReviews();
  }, [fetchProductAndReviews]);

  useEffect(() => {
    if (addedToCartMessage) {
      const timer = setTimeout(() => setAddedToCartMessage(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [addedToCartMessage]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!productId || newReviewRating === 0 || !newReviewComment.trim() || !newReviewName.trim()) {
      setReviewError('Please provide your name, a rating (1-5 stars), and a comment.');
      return;
    }
    setIsSubmittingReview(true);
    const reviewSubmitted = await addReview({
      productId,
      userName: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      userId: `anon-${Date.now()}` 
    });
    setIsSubmittingReview(false);

    if (reviewSubmitted) {
      fetchProductAndReviews();
      setShowReviewForm(false);
      setNewReviewName('');
      setNewReviewRating(0);
      setNewReviewComment('');
      setReviewSuccess('Your review has been submitted successfully!');
      setTimeout(() => setReviewSuccess(''), 3000);
    } else {
      setReviewError('Failed to submit review. Please try again.');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      setAddedToCartMessage(true);
    }
  };

  const handleChatWithSeller = () => {
    if (product) {
      navigate(`/chat/seller-${product.sellerId}-product-${product.id}`);
    } else {
      
      navigate('/chat/unknown');
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(1));
  }, [reviews]);

  if (isLoadingProducts || product === undefined) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><LoadingSpinner size="xl" /></div>;
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-semibold text-red-600 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you are looking for does not exist or may have been removed.</p>
        <Link to="/"><Button variant="primary">Go to Homepage</Button></Link>
      </div>
    );
  }
  
  const itemAlreadyInCart = isItemInCart(product.id);

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md">
          <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/600`} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider mb-1">{product.category}</span>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">{product.name}</h1>
          <p className="text-gray-500 text-sm mb-4">Sprzedawca: <span className="text-gray-700 font-medium">{product.sellerName}</span></p>
          
          {reviews.length > 0 && (
            <div className="flex items-center mb-5">
              <StarRatingInput rating={averageRating} setRating={() => {}} disabled size="sm" />
              <span className="ml-2 text-sm text-gray-600">Średnia recenzji ({averageRating.toFixed(1)} z {reviews.length} recenzji)</span>
            </div>
          )}
          
          <p className="text-gray-700 leading-relaxed mb-6 text-base">{product.description}</p>
          <p className="text-indigo-600 font-extrabold text-4xl lg:text-5xl mb-8">{product.price.toFixed(2)} PLN</p>
          
          <div className="mt-auto space-y-3">
             <Button 
                size="lg" 
                isFullWidth 
                leftIcon={addedToCartMessage || itemAlreadyInCart ? <CheckCircleIcon className="w-5 h-5"/> : <CartIconHero className="w-5 h-5"/>} 
                onClick={handleAddToCart}
                variant={addedToCartMessage || itemAlreadyInCart ? 'success' : 'primary'}
                disabled={addedToCartMessage}
              >
              {addedToCartMessage ? 'Added to Cart!' : itemAlreadyInCart ? 'Dodaj więcej do koszyka' : 'Dodaj do koszyka'}
            </Button>
            { itemAlreadyInCart && !addedToCartMessage && (
                <Button size="md" variant="ghost" isFullWidth onClick={() => navigate('/cart')}>
                    View Cart
                </Button>
            )}
            <Button variant="ghost" size="lg" isFullWidth leftIcon={<ChatBubbleLeftEllipsisIcon className="w-5 h-5"/>} onClick={handleChatWithSeller}>
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">Recenzje <span className="text-gray-500 font-normal">({reviews.length})</span></h2>
          <Button onClick={() => { setShowReviewForm(!showReviewForm); setReviewError(''); setReviewSuccess(''); }} variant={showReviewForm ? "secondary" : "primary"}>
            {showReviewForm ? 'Anuluj' : 'Napisz recenzje'}
          </Button>
        </div>

        {reviewSuccess && <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md text-sm">{reviewSuccess}</div>}
        {reviewError && !isSubmittingReview && <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm">{reviewError}</div>}
        
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-lg shadow-inner mb-10 space-y-5 border border-gray-200">
            <h3 className="text-xl font-medium text-gray-700">Podziel się opinią</h3>
            <Input 
              label="Imie*"
              value={newReviewName} 
              onChange={(e) => setNewReviewName(e.target.value)} 
              placeholder="e.g. Jane D."
              required 
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Twoja ocena*</label>
              <StarRatingInput rating={newReviewRating} setRating={setNewReviewRating} size="md" />
            </div>
            <Textarea 
              label="Recenzja*"
              value={newReviewComment} 
              onChange={(e) => setNewReviewComment(e.target.value)} 
              placeholder="Co Ci się podobało w produkcie, a co nie? "
              rows={5} 
              required
            />
            {reviewError && isSubmittingReview && <p className="text-red-500 text-sm">{reviewError}</p>}
            <div className="flex justify-end">
                <Button type="submit" isLoading={isSubmittingReview} disabled={isSubmittingReview} size="lg">
                Wyślij
                </Button>
            </div>
          </form>
        )}

        {isLoadingProducts && reviews.length === 0 && <div className="py-8"><LoadingSpinner /></div>}
        {!isLoadingProducts && reviews.length === 0 && !showReviewForm && (
          <p className="text-gray-600 py-6 text-center text-lg">This product has no reviews yet. Be the first to share your experience!</p>
        )}
        {!isLoadingProducts && reviews.length > 0 && (
          <div className="space-y-6">
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
