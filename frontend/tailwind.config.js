export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E3A5F',
          900: '#1F4E79',
          DEFAULT: '#1F4E79',
          light: '#2E75B6',
          lighter: '#BDD7EE',
        },
        surface: '#F8FAFC',
        sidebar: '#0F2942',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,.07), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,.10)',
        sidebar: '4px 0 24px rgba(0,0,0,.15)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)',
        'gradient-card': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-green': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'gradient-amber': 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        'gradient-red':   'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
        'gradient-purple':'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-up': 'slideUp .25s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
