/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        afriland: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'skeleton': 'skeleton-loading 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'skeleton-loading': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': 'calc(200% + 100%) 0' },
        },
      },
      boxShadow: {
        'afriland': '0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -2px rgba(220, 38, 38, 0.1)',
        'afriland-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -4px rgba(220, 38, 38, 0.1)',
      },
    },
  },
  plugins: [],
}
