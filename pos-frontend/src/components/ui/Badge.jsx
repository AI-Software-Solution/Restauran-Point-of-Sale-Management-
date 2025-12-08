import React from 'react';

const variants = {
  default: 'bg-surface-secondary text-text-primary border border-border',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-light text-success-dark',
  warning: 'bg-warning-light text-warning-dark',
  danger: 'bg-danger-light text-danger-dark',
  info: 'bg-info-light text-info-dark',
  // Solid variants
  'primary-solid': 'bg-primary-500 text-white',
  'success-solid': 'bg-success text-white',
  'warning-solid': 'bg-warning text-warning-dark',
  'danger-solid': 'bg-danger text-white',
  'info-solid': 'bg-info text-white',
  // Outline variants
  'primary-outline': 'bg-transparent border-2 border-primary-500 text-primary-500',
  'success-outline': 'bg-transparent border-2 border-success text-success',
  'warning-outline': 'bg-transparent border-2 border-warning text-warning-dark',
  'danger-outline': 'bg-transparent border-2 border-danger text-danger',
  'info-outline': 'bg-transparent border-2 border-info text-info',
};

const sizes = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  dot = false,
  removable = false,
  onRemove,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1 font-medium';
  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    roundedClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant.includes('success') ? 'bg-success' :
            variant.includes('warning') ? 'bg-warning-dark' :
            variant.includes('danger') ? 'bg-danger' :
            variant.includes('info') ? 'bg-info' :
            variant.includes('primary') ? 'bg-primary-500' :
            'bg-current'
          }`}
        />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 -mr-1 h-4 w-4 inline-flex items-center justify-center rounded-full hover:bg-black/10 focus:outline-none"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

Badge.displayName = 'Badge';

// Status Badge for Tables
export const TableStatusBadge = ({ status, className = '', ...props }) => {
  const statusConfig = {
    Available: { variant: 'success', label: "Bo'sh" },
    Occupied: { variant: 'danger', label: 'Band' },
    Reserved: { variant: 'warning', label: 'Bron' },
    Cleaning: { variant: 'info', label: 'Tozalash' },
  };

  const config = statusConfig[status] || statusConfig.Available;

  return (
    <Badge variant={config.variant} dot className={className} {...props}>
      {config.label}
    </Badge>
  );
};

TableStatusBadge.displayName = 'TableStatusBadge';

// Order Status Badge
export const OrderStatusBadge = ({ status, className = '', ...props }) => {
  const statusConfig = {
    Pending: { variant: 'warning', label: 'Kutilmoqda' },
    'In Progress': { variant: 'info', label: 'Tayyorlanmoqda' },
    Ready: { variant: 'success', label: 'Tayyor' },
    Completed: { variant: 'success-solid', label: 'Tugatildi' },
    Cancelled: { variant: 'danger', label: 'Bekor qilindi' },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.label}
    </Badge>
  );
};

OrderStatusBadge.displayName = 'OrderStatusBadge';

// Counter Badge (for notifications, cart items, etc.)
export const CounterBadge = ({
  count,
  max = 99,
  showZero = false,
  variant = 'danger-solid',
  className = '',
  ...props
}) => {
  if (!showZero && count === 0) return null;

  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size="xs"
      className={`min-w-[1.25rem] justify-center ${className}`}
      {...props}
    >
      {displayCount}
    </Badge>
  );
};

CounterBadge.displayName = 'CounterBadge';

export default Badge;
