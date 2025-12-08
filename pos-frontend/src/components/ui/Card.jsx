import React from 'react';

const variants = {
  default: 'bg-surface border border-border',
  elevated: 'bg-surface shadow-md',
  bordered: 'bg-surface border-2 border-border',
  ghost: 'bg-transparent',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card = React.forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false,
  className = '',
  onClick,
  ...props
}, ref) => {
  const baseClasses = 'rounded-lg transition-all duration-200';
  const variantClasses = variants[variant] || variants.default;
  const paddingClasses = paddings[padding] || paddings.md;
  const hoverClasses = hover ? 'hover:shadow-md hover:-translate-y-0.5' : '';
  const interactiveClasses = interactive ? 'cursor-pointer active:scale-[0.99]' : '';
  const shadowClass = variant !== 'ghost' ? 'shadow-card' : '';

  const classes = [
    baseClasses,
    variantClasses,
    paddingClasses,
    shadowClass,
    hoverClasses,
    interactiveClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      onClick={onClick}
      role={interactive || onClick ? 'button' : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

// Card subcomponents
export const CardHeader = ({ children, className = '', ...props }) => (
  <div
    className={`px-4 py-3 border-b border-border ${className}`}
    {...props}
  >
    {children}
  </div>
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ children, className = '', as: Component = 'h3', ...props }) => (
  <Component
    className={`text-lg font-semibold text-text-primary ${className}`}
    {...props}
  >
    {children}
  </Component>
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ children, className = '', ...props }) => (
  <p
    className={`text-sm text-text-secondary mt-1 ${className}`}
    {...props}
  >
    {children}
  </p>
);

CardDescription.displayName = 'CardDescription';

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-4 ${className}`} {...props}>
    {children}
  </div>
);

CardContent.displayName = 'CardContent';

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={`px-4 py-3 border-t border-border bg-surface-secondary/50 ${className}`}
    {...props}
  >
    {children}
  </div>
);

CardFooter.displayName = 'CardFooter';

// Stats Card (for dashboard metrics)
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon: Icon,
  className = '',
  ...props
}) => {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-text-secondary',
  };

  return (
    <Card className={`${className}`} {...props}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {changeType === 'positive' && '+'}
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-primary-500/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary-500" />
          </div>
        )}
      </div>
    </Card>
  );
};

StatsCard.displayName = 'StatsCard';

export default Card;
