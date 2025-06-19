
import React from 'react';
import { Review } from '../types';
import { UserCircleIcon } from '@heroicons/react/24/solid';

interface ReviewCardProps {
  review: Review;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "1" : "1.5"}
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321l5.584.532c.571.054.808.82.387 1.233l-4.085 3.461a.563.563 0 00-.182.527l1.28 5.318a.563.563 0 01-.841.61l-4.896-2.882a.563.563 0 00-.546 0L5.49 20.679a.563.563 0 01-.841-.61l1.28-5.318a.563.563 0 00-.182-.527L1.66 10.695c-.421-.413-.184-1.18.387-1.233l5.584-.532a.563.563 0 00.475-.321L11.48 3.5z" />
  </svg>
);


const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-start mb-3">
        <UserCircleIcon className="h-10 w-10 text-gray-400 mr-3 flex-shrink-0" />
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-lg">{review.userName}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < review.rating} />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Reviewed on: {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      <p className="text-gray-700 leading-relaxed text-sm">{review.comment}</p>
    </div>
  );
};

export default ReviewCard;