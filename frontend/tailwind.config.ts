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
        cardinal: {
          DEFAULT: '#D2232A',
          hover: '#B01E24',
          light: '#FFF1F1',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#D2232A',
          600: '#B01E24',
          700: '#8B1A1E',
          800: '#6B1418',
          900: '#450D10',
        },
        thunder: '#0F172A',
        slate: '#64748B',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        'dark-surface': '#1E293B',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)',
        'topbar': '0 1px 3px rgba(0,0,0,0.04)',
        'glow': '0 0 20px rgba(210, 35, 42, 0.12)',
        'glow-lg': '0 0 40px rgba(210, 35, 42, 0.18)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
        'elevated': '0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.06)',
        'glass-panel': '0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-sidebar': '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-cardinal': 'linear-gradient(135deg, #D2232A, #B01E24)',
        'gradient-dark': 'linear-gradient(180deg, #0F172A, #1E293B)',
        'gradient-surface': 'linear-gradient(135deg, #F8FAFC, #F1F5F9)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'slide-in-left': 'slideInLeft 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'count-up': 'countUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(210, 35, 42, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(210, 35, 42, 0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
