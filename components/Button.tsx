
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  leftIcon,
  rightIcon,
  isFullWidth = false,
  rounded = 'md',
  ...props
}) => {
  const baseStyles = "font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out inline-flex items-center justify-center shadow-sm hover:shadow-md active:shadow-inner disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border border-transparent",
    secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400 border border-slate-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400 border border-transparent",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-100 focus:ring-indigo-500 border border-transparent hover:border-indigo-200"
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
    xl: "px-8 py-3 text-lg"
  };

  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
  };

  const widthStyle = isFullWidth ? "w-full" : "";
  
  const loadingStyles = isLoading ? "opacity-75 cursor-wait" : "";
  

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${roundedStyles[rounded]} ${widthStyle} ${loadingStyles} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
         style={{ marginLeft: leftIcon ? '-0.25rem' : '0', marginRight: children ? '0.75rem' : '0' }}>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className={children ? "mr-2" : ""}>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className={children ? "ml-2" : ""}>{rightIcon}</span>}
    </button>
  );
};

export default Button;