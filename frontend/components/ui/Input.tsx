import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-black text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-secondary-mediumblack text-black placeholder-black-400 border ${
          error ? 'border-red-500' : 'border-secondary-lightblack'
        } rounded focus:outline-none focus:border-primary-gold transition ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};
