import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  actionText = 'VIEW DETAILS',
  onActionClick,
  variant = 'default',
}) => {
  const variantClasses = {
    default: {
      border: 'border-black-200',
      value: 'text-black-900',
      bg: 'bg-white',
      accent: 'text-black-600',
    },
    primary: {
      border: 'border-blue-200',
      value: 'text-blue-700',
      bg: 'bg-blue-50',
      accent: 'text-blue-600',
    },
    success: {
      border: 'border-green-200',
      value: 'text-green-700',
      bg: 'bg-green-50',
      accent: 'text-green-600',
    },
    warning: {
      border: 'border-orange-200',
      value: 'text-orange-700',
      bg: 'bg-orange-50',
      accent: 'text-orange-600',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div
      className={`${styles.bg} rounded-lg p-6 border-2 ${styles.border} hover:border-yellow-500 transition-all shadow-sm hover:shadow-md`}
    >
      <h3 className="text-sm font-medium text-black-600 mb-2 uppercase tracking-wide">{title}</h3>
      <p className={`text-3xl sm:text-4xl font-bold ${styles.value} mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && <p className={`text-xs ${styles.accent} mb-4`}>{subtitle}</p>}
      {onActionClick && (
        <button
          onClick={onActionClick}
          className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold uppercase transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
