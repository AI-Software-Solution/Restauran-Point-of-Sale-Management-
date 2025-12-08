import React from 'react';

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  containerClassName = '',
  disabled = false,
  required = false,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = [
    'w-full rounded-md border bg-surface text-text-primary',
    'placeholder:text-text-muted',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'transition-colors duration-200',
    'disabled:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ');

  const sizeClasses = sizes[size] || sizes.md;
  const errorClasses = error
    ? 'border-danger focus:ring-danger focus:border-danger'
    : 'border-border focus:ring-primary-500 focus:border-primary-500';
  const iconPadding = LeftIcon ? 'pl-10' : '';
  const rightIconPadding = RightIcon ? 'pr-10' : '';

  const inputClasses = [
    baseClasses,
    sizeClasses,
    errorClasses,
    iconPadding,
    rightIconPadding,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-5 w-5 text-text-muted" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={inputClasses}
          {...props}
        />
        {RightIcon && (
          <div
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            }`}
            onClick={onRightIconClick}
          >
            <RightIcon className="h-5 w-5 text-text-muted hover:text-text-secondary" />
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p
          className={`mt-1.5 text-xs ${
            error ? 'text-danger' : 'text-text-secondary'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  disabled = false,
  required = false,
  rows = 3,
  id,
  ...props
}, ref) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = [
    'w-full px-3 py-2 text-sm rounded-md border bg-surface text-text-primary',
    'placeholder:text-text-muted',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'transition-colors duration-200 resize-none',
    'disabled:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ');

  const errorClasses = error
    ? 'border-danger focus:ring-danger focus:border-danger'
    : 'border-border focus:ring-primary-500 focus:border-primary-500';

  const textareaClasses = [baseClasses, errorClasses, className].filter(Boolean).join(' ');

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        disabled={disabled}
        required={required}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {(error || helperText) && (
        <p
          className={`mt-1.5 text-xs ${
            error ? 'text-danger' : 'text-text-secondary'
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

// Search Input
export const SearchInput = React.forwardRef(({
  onClear,
  value,
  className = '',
  placeholder = 'Qidirish...',
  ...props
}, ref) => {
  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      placeholder={placeholder}
      leftIcon={(props) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          {...props}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      )}
      rightIcon={
        value
          ? (props) => (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                {...props}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            )
          : undefined
      }
      onRightIconClick={value ? onClear : undefined}
      className={className}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

export default Input;
