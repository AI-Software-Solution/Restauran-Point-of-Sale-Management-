import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext(null);

const variants = {
  default: {
    list: 'bg-surface-secondary/50 p-1 rounded-lg',
    trigger: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
    triggerActive: 'bg-surface text-text-primary shadow-sm',
    triggerInactive: 'text-text-secondary hover:text-text-primary',
  },
  underline: {
    list: 'border-b border-border',
    trigger: 'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
    triggerActive: 'border-primary-500 text-primary-500',
    triggerInactive: 'border-transparent text-text-secondary hover:text-text-primary hover:border-border',
  },
  pills: {
    list: 'gap-2',
    trigger: 'px-4 py-2 text-sm font-medium rounded-full transition-all',
    triggerActive: 'bg-primary-500 text-white',
    triggerInactive: 'text-text-secondary hover:bg-surface-secondary',
  },
  boxed: {
    list: 'border border-border rounded-lg p-1 gap-1',
    trigger: 'px-4 py-2 text-sm font-medium rounded-md transition-all',
    triggerActive: 'bg-primary-500 text-white',
    triggerInactive: 'text-text-secondary hover:bg-surface-secondary',
  },
};

export const Tabs = ({
  children,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{
        value: currentValue,
        onValueChange: handleValueChange,
        variant,
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.displayName = 'Tabs';

export const TabsList = ({ children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsList must be used within Tabs');

  const { variant } = context;
  const variantStyles = variants[variant] || variants.default;

  return (
    <div
      className={`inline-flex items-center ${variantStyles.list} ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
};

TabsList.displayName = 'TabsList';

export const TabsTrigger = ({
  children,
  value,
  disabled = false,
  icon: Icon,
  count,
  className = '',
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const { value: currentValue, onValueChange, variant } = context;
  const isActive = currentValue === value;
  const variantStyles = variants[variant] || variants.default;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={`
        ${variantStyles.trigger}
        ${isActive ? variantStyles.triggerActive : variantStyles.triggerInactive}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        inline-flex items-center gap-2
        ${className}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
      {count !== undefined && (
        <span
          className={`
            ml-1 px-1.5 py-0.5 text-xs rounded-full
            ${isActive
              ? variant === 'pills' || variant === 'boxed'
                ? 'bg-white/20 text-white'
                : 'bg-primary-500/10 text-primary-500'
              : 'bg-surface-secondary text-text-secondary'
            }
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
};

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = ({ children, value, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  const { value: currentValue } = context;

  if (currentValue !== value) return null;

  return (
    <div
      role="tabpanel"
      className={`mt-4 animate-fade-in ${className}`}
    >
      {children}
    </div>
  );
};

TabsContent.displayName = 'TabsContent';

// Simple Tab Bar (for mobile/quick navigation)
export const TabBar = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
}) => {
  const variantStyles = variants[variant] || variants.default;

  return (
    <div
      className={`
        inline-flex items-center ${variantStyles.list}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={`
            ${variantStyles.trigger}
            ${activeTab === tab.value ? variantStyles.triggerActive : variantStyles.triggerInactive}
            ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${fullWidth ? 'flex-1' : ''}
            inline-flex items-center justify-center gap-2
          `}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`
                ml-1 px-1.5 py-0.5 text-xs rounded-full
                ${activeTab === tab.value
                  ? 'bg-white/20'
                  : 'bg-surface-secondary text-text-secondary'
                }
              `}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

TabBar.displayName = 'TabBar';

export default Tabs;
