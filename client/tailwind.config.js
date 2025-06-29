/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: '#F5F3EF',
        charcoal: '#181818',
        'soft-gray': '#E5E3DF',
        'mid-gray': '#CFCBC6',
        'accent-black': '#000000',
        white: '#FFFFFF',
        'secondary-text': '#888888',
        'body-text': '#222222',
        heading: '#181818',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 