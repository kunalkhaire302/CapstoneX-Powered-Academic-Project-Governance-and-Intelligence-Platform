import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5', // Indigo 600
          hover: '#4338CA',   // Indigo 700
          light: '#EEF2FF',   // Indigo 50
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        thunder: '#0F172A',
        slate: '#64748B',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        'dark-surface': '#1E293B',
        'cx-text': '#0F172A',
        'cx-text-secondary': '#475569',
        'cx-text-muted': '#94A3B8',
        'cx-border': '#E2E8F0',
        'cx-border-subtle': '#F1F5F9',
        'cx-bg-subtle': '#F8FAFC',
        'cx-bg-muted': '#F1F5F9',
      },
      fontFamily: {
        display: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
        body: ['Capstone Sans', 'Segoe UI', '-apple-system', 'sans-serif'],
        mono: ['Capstone Mono', 'ui-monospace', 'Cascadia Mono', 'monospace'],
      },
      borderRadius: {
        'cx-sm': '6px',
        'cx-md': '8px',
        'cx-lg': '12px',
        'cx-xl': '16px',
        'cx-2xl': '20px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'topbar': '0 1px 3px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(79, 70, 229, 0.12)',
        'glow-lg': '0 0 40px rgba(79, 70, 229, 0.18)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.06)',
        'brand': '0 4px 14px rgba(79, 70, 229, 0.25)',
        'focus': '0 0 0 3px rgba(79, 70, 229, 0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #4F46E5, #4338CA)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A, #1E293B)',
        'gradient-surface': 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
      },
      fontSize: {
        'cx-xs': ['0.75rem', { lineHeight: '1.5' }],
        'cx-sm': ['0.8125rem', { lineHeight: '1.5' }],
        'cx-base': ['0.875rem', { lineHeight: '1.5' }],
        'cx-md': ['0.9375rem', { lineHeight: '1.5' }],
        'cx-lg': ['1.0625rem', { lineHeight: '1.35' }],
        'cx-xl': ['1.25rem', { lineHeight: '1.3' }],
        'cx-2xl': ['1.5rem', { lineHeight: '1.25' }],
        'cx-3xl': ['1.875rem', { lineHeight: '1.2' }],
      },
      spacing: {
        'sidebar': '264px',
        'sidebar-collapsed': '72px',
        'topbar': '64px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0, 0, 0.2, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0, 0, 0.2, 1) forwards',
        'count-up': 'countUp 0.4s cubic-bezier(0, 0, 0.2, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
