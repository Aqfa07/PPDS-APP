import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      colors: {
        emerald: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        brand: {
          DEFAULT: '#059669',
          light:   '#10b981',
          dark:    '#047857',
          muted:   '#ecfdf5',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        'gradient-soft':  'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
      },
      boxShadow: {
        'soft-sm': '0 2px 8px 0 rgba(0,0,0,0.06)',
        'soft':    '0 4px 16px 0 rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 32px 0 rgba(0,0,0,0.10)',
        'brand':   '0 4px 20px 0 rgba(5,150,105,0.25)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-soft':  'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
}

export default config
