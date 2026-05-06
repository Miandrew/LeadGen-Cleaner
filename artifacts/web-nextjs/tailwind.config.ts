import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B3A6B',
          50: '#EEF2F9',
          100: '#D4DDEF',
          200: '#A9BCDE',
          300: '#7E9ACE',
          400: '#5379BE',
          500: '#1B3A6B',
          600: '#162F56',
          700: '#102341',
          800: '#0B172C',
          900: '#050C17',
        },
        accent: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
      },
    },
  },
  plugins: [],
}

export default config
