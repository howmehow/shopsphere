
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string; 
  thickness?: 'thin' | 'normal' | 'thick';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-indigo-600', 
  thickness = 'normal',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const thicknessClasses = {
    thin: 'border-2',
    normal: 'border-4', 
    thick: 'border-[6px]',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} ${thicknessClasses[thickness]}`}
        style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} 
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;