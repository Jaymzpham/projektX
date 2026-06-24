/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#00C853', dark: '#00A844', light: '#E8F5E9' },
      },
    },
  },
  plugins: [],
}
