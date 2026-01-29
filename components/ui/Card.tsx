import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'accent';
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  variant = 'default',
  icon,
}) => {
  const variantStyles = {
    default:
      'bg-white border border-gray-200 shadow-sm hover:shadow-md',
    elevated:
      'bg-white border border-gray-100 shadow-lg hover:shadow-xl',
    bordered:
      'bg-white border-2 border-green-200 shadow-sm hover:shadow-md hover:border-green-300',
    accent:
      'bg-gradient-to-br from-white to-green-50 border border-green-200 shadow-sm hover:shadow-md',
  };

  return (
    <div
      className={`rounded-xl p-6 transition-all duration-200 ${variantStyles[variant]} ${className}`}
    >
      {title && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
