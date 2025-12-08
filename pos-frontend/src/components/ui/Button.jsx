import React from 'react';

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-secondary focus:ring-primary-500',
  outline: 'border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white focus:ring-primary-500',
  ghost: 'text-primary-500 bg-transparent hover:bg-primary-500/10 focus:ring-primary-500',
  danger: 'bg-danger text-white hover:bg-danger-dark focus:ring-danger',
  success: 'bg-success text-white hover:bg-success-dark focus:ring-success',
  warning: 'bg-warning text-warning-dark hover:bg-warning-dark hover:text-white focus:ring-warning',
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  const baseClasses = [
    'inline-flex items-center justify-center gap-2 font-medium rounded-md',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' ');

  const variantClasses = variants[variant] || variants.primary;
  const sizeClasses = sizes[size] || sizes.md;
  const widthClasses = fullWidth ? 'w-full' : '';

  const classes = [
    baseClasses,
    variantClasses,
    sizeClasses,
    widthClasses,
    className,
  ].filter(Boolean).join(' ');

  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={classes}
      {...props}
    >
      {loading && (
        <svg
          className={`animate-spin ${iconSize}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={iconSize} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={iconSize} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

// Icon-only button variant
export const IconButton = React.forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const iconOnlySizes = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
    xl: 'p-3',
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${iconOnlySizes[size]} ${className}`}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export default Button;
