/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'beige-gradient': 'linear-gradient(135deg, #f5f1e8 0%, #e8dcc8 25%, #d4c5a9 50%, #e8dcc8 75%, #f5f1e8 100%)',
        'beige-gradient-dark': 'linear-gradient(135deg, #e8dcc8 0%, #d4c5a9 25%, #c5b494 50%, #d4c5a9 75%, #e8dcc8 100%)',
      },
      colors: {
        beige: {
          50: '#faf8f3',
          100: '#f5f1e8',
          200: '#e8dcc8',
          300: '#d4c5a9',
          400: '#c5b494',
          500: '#b5a280',
          600: '#9d8a6b',
          700: '#7d6e56',
          800: '#5e5342',
          900: '#3f382d',
        },
      },
    },
  },
  plugins: [],
}
