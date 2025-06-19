
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, name, error, className = '', wrapperClassName = '', leftIcon, rightIcon, ...props }) => {
  const hasError = !!error;
  const baseInputClasses = `block w-full py-2.5 border shadow-sm focus:outline-none sm:text-sm rounded-md transition-colors duration-150 ease-in-out`;
  const inputPadding = `${leftIcon ? 'pl-10' : 'pl-3'} ${rightIcon ? 'pr-10' : 'pr-3'}`;
  const errorClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-700 placeholder-red-400';
  const normalClasses = 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400';

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={name || props.id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {React.isValidElement(leftIcon) && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(leftIcon as React.ReactElement<{ className?: string }>, { 
              className: `h-5 w-5 ${hasError ? 'text-red-500' : 'text-gray-400'}`
            })}
          </div>
        )}
        <input
          id={name || props.id}
          name={name}
          className={`${baseInputClasses} ${inputPadding} ${hasError ? errorClasses : normalClasses} ${className}`}
          {...props}
        />
        {React.isValidElement(rightIcon) && !error && (
           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
             {React.cloneElement(rightIcon as React.ReactElement<{ className?: string }>, { 
               className: "h-5 w-5 text-gray-400"
             })}
           </div>
        )}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default Input;

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, name, error, className = '', wrapperClassName = '', ...props }) => {
  const hasError = !!error;
  const baseInputClasses = `block w-full px-3 py-2.5 border shadow-sm focus:outline-none sm:text-sm rounded-md transition-colors duration-150 ease-in-out`;
  const errorClasses = 'border-red-500 focus:ring-red-500 focus:border-red-500 text-red-700 placeholder-red-400';
  const normalClasses = 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400';


  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={name || props.id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={name || props.id}
        name={name}
        className={`${baseInputClasses} ${hasError ? errorClasses : normalClasses} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
};
