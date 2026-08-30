/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f9e8',
          100: '#e6f2c9',
          400: '#9ed138',
          500: '#84c22a',   // primary FitCore green (buttons, active nav)
          600: '#6ba321',
          900: '#2e4310',
        },
        cream: '#f7f9ef',   // soft sage/cream background used across screens
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
