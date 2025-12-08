/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Odoo-style Primary Colors (using CSS variables for theming)
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          50: '#F5F0F4',
          100: '#EBE1E8',
          200: '#D7C3D1',
          300: '#C3A5BA',
          400: '#AF87A3',
          500: '#714B67', // Odoo Purple
          600: '#5C3D56',
          700: '#472F42',
          800: '#32212E',
          900: '#1D131A',
        },
        // Semantic Colors
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-secondary': 'var(--color-surface-secondary)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        // Text Colors
        'text-primary': 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        // Status Colors
        success: {
          DEFAULT: '#28A745',
          light: '#D4EDDA',
          dark: '#1E7E34',
        },
        warning: {
          DEFAULT: '#FFC107',
          light: '#FFF3CD',
          dark: '#D39E00',
        },
        danger: {
          DEFAULT: '#DC3545',
          light: '#F8D7DA',
          dark: '#BD2130',
        },
        info: {
          DEFAULT: '#17A2B8',
          light: '#D1ECF1',
          dark: '#117A8B',
        },
        // Table Status Colors
        'table-available': '#28A745',
        'table-occupied': '#DC3545',
        'table-reserved': '#FFC107',
        'table-cleaning': '#17A2B8',
        // Odoo Accent Colors
        odoo: {
          purple: '#714B67',
          'purple-dark': '#5C3D56',
          'purple-light': '#8A6180',
          teal: '#017E84',
          'teal-light': '#00A09D',
        },
        // Legacy Imperial Theme (for backward compatibility)
        imperial: {
          gold: '#D4AF37',
          'gold-light': '#E8C547',
          'gold-dark': '#B8941F',
          navy: '#1a1a2e',
          'navy-light': '#252836',
          burgundy: '#722F37',
          cream: '#F5F5DC',
          'cream-dark': '#E8E8D0',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        // Dark theme shadows
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #714B67 0%, #5C3D56 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a2e 0%, #252836 100%)',
        'gradient-light': 'linear-gradient(135deg, #F0F0F0 0%, #FFFFFF 100%)',
        // Legacy gradients
        'imperial-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #E8C547 50%, #D4AF37 100%)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
}
