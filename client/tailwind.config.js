/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F8CFD6',
          300: '#F0AAB6',
          400: '#E37286',
          500: '#A31D33',
          600: '#800020',
          700: '#6B001B',
          800: '#540015',
          900: '#3D000F',
          950: '#26000A',
        },
        cream: {
          50: '#FFFDF9',
          100: '#FAF6EE',
          200: '#F5EFEB',
          300: '#EDE4DB',
          400: '#E2D5C7',
          500: '#D5C4B3',
          border: '#E6DACB',
          muted: '#F3ECE2',
          text: '#2C1810',
        },
        brand: {
          50: '#FDF2F4',
          100: '#FCE7EA',
          200: '#F8CFD6',
          300: '#F0AAB6',
          400: '#E37286',
          500: '#A31D33',
          600: '#800020',
          700: '#6B001B',
          800: '#540015',
          900: '#3D000F',
          950: '#26000A',
        },
        dark: {
          bg: '#0B0F17',
          card: '#111827',
          border: '#1E293B',
          text: '#F8FAFC',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
