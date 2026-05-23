export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1F4E79', light: '#2E75B6', lighter: '#BDD7EE' },
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#d97706',
      }
    }
  },
  plugins: []
};
