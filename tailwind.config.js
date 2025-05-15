/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#080F17',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        accent: {
          DEFAULT: '#B4E66E',
          50: '#F7FCF0',
          100: '#EFF9E2',
          200: '#DFF3C5',
          300: '#CFEDA8',
          400: '#C0E78B',
          500: '#B4E66E',
          600: '#9CDB42',
          700: '#82C226',
          800: '#63941D',
          900: '#446614',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};