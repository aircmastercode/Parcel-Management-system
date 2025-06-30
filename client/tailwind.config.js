/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Color Palette
        'palette-light': '#F2F2F2',     // Light gray background
        'palette-beige': '#EAE4D5',     // Beige/cream
        'palette-mid': '#B6B09F',       // Mid-tone gray
        'palette-dark': '#000000',      // Pure black
        
        // Legacy colors for compatibility (will be replaced)
        beige: '#EAE4D5',
        charcoal: '#000000',
        'soft-gray': '#F2F2F2',
        'mid-gray': '#B6B09F',
        'accent-black': '#000000',
        white: '#FFFFFF',
        'secondary-text': '#B6B09F',
        'body-text': '#000000',
        heading: '#000000',
        
        // Railway Color Palette (keeping blue for accent/interactive elements)
        'railway-primary': '#1e40af',
        'railway-primary-light': '#3b82f6',
        'railway-primary-dark': '#1e3a8a',
        'railway-secondary': '#6366f1',
        'railway-secondary-light': '#8b5cf6',
        'railway-secondary-dark': '#4f46e5',
        
        // Status Colors (keeping for functionality)
        'success': '#10b981',
        'success-light': '#34d399',
        'success-dark': '#059669',
        'warning': '#f59e0b',
        'warning-light': '#fbbf24',
        'warning-dark': '#d97706',
        'error': '#ef4444',
        'error-light': '#f87171',
        'error-dark': '#dc2626',
        
        // Accent for interactive elements
        'accent': '#1e40af',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 