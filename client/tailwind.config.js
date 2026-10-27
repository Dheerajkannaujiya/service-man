/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00F2FE',
          blue: '#4FACFE',
          indigo: '#6366F1',
          emerald: '#10B981',
          violet: '#8B5CF6',
          amber: '#F59E0B',
          rose: '#F43F5E'
        },
        dark: {
          base: '#080B11',
          card: '#0E1424',
          panel: '#131B30',
          elevated: '#1A243D',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec5ff',
          400: '#59a2ff',
          500: '#327eff',
          600: '#1a5ef5',
          700: '#144ae1',
          800: '#173cb6',
          900: '#18368f',
          950: '#122257'
        }
      },
      fontFamily: {
        sans: ['"Gilroy"', '"Gilroy-Medium"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Gilroy-Bold"', '"Gilroy"', '"Gilroy-Heavy"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Gilroy-Bold"', '"Gilroy"', '"Gilroy-Heavy"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 242, 254, 0.35)',
        'glow-indigo': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glass-card': '0 20px 40px -15px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
