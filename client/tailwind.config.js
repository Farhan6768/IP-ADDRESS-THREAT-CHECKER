/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          darkest: '#FFFFFF',
          darker: '#F8FAFC',
          DEFAULT: '#FFFFFF',
          light: '#F1F5F9',
          card: '#FFFFFF',
          border: '#E2E8F0',
          borderSubtle: '#F1F5F9'
        },
        red: {
          primary: '#BF092F',
          hover: '#A00727',
          active: '#83061F',
          glow: 'rgba(191, 9, 47, 0.12)',
          muted: 'rgba(191, 9, 47, 0.08)'
        },
        blue: {
          panel: '#1E40AF',
          hover: '#1D4ED8',
          dark: '#172554',
          glow: 'rgba(30, 64, 175, 0.12)'
        },
        teal: {
          safe: '#0D9488',
          hover: '#0F766E',
          glow: 'rgba(13, 148, 136, 0.12)',
          muted: 'rgba(13, 148, 136, 0.08)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
