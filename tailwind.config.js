/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        'border-border': 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f8fafd',
          100: '#e9e6ff',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#36aaf5',
          500: '#0d8de3',
          600: '#1a237e',
          700: '#0559a0',
          800: '#0a4b84',
          900: '#0f406e',
          950: '#0a2847',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#f6f4fe',
          100: '#eeebfd',
          200: '#dfd9fb',
          300: '#cabcf7',
          400: '#b196f1',
          500: '#9a72e9',
          600: '#6c47ff',
          700: '#7440c3',
          800: '#6035a0',
          900: '#502e81',
          950: '#321c56',
        },
        dark: {
          100: '#d5d6d8',
          200: '#aaadb1',
          300: '#80848b',
          400: '#555b64',
          500: '#2b323d',
          600: '#222831',
          700: '#1a1e25',
          800: '#11151a',
          900: '#090b0d',
        },
        electric: {
          400: '#3be3ff',
        },
      },
      animation: {
        'progress-indeterminate': 'progress-indeterminate 1.5s infinite linear',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'gradient-x': 'gradient-x 4s ease-in-out infinite',
      },
      keyframes: {
        'progress-indeterminate': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
      boxShadow: {
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium': '0 4px 24px 0 rgba(108, 71, 255, 0.12)',
        'glow': '0 0 12px 2px #6c47ff44',
      },
    },
  },
  plugins: [],
};
