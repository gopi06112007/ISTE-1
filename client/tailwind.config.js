/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'iste-blue': '#1A56DB',
        'iste-violet': '#7C3AED',
        'iste-teal': '#0D9488',
        'iste-amber': '#F59E0B',
        // Glass tokens for light mode (kept for fallback)
        'glass-bg': 'rgba(255, 255, 255, 0.6)',
        'glass-border': 'rgba(255, 255, 255, 0.4)',
        // Claymorphism colors
        'clay-bg': '#EEF1F5',
        'clay-cse': '#A8C5F0',
        'clay-ece': '#C9B8F0',
        'clay-eee': '#F0D9A8',
        'clay-mech': '#C7CDD6',
        'clay-civil': '#A8E0D4',
        'clay-it': '#F0B8D4',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        accent: ['"Space Grotesk"', 'sans-serif'],
      },
      backdropBlur: {
        sm: '8px',
        md: '16px',
        lg: '28px',
        xl: '40px',
      },
      borderRadius: {
        'clay-sm': '20px',
        'clay-md': '28px',
        'clay-lg': '36px',
        'clay-xl': '48px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(26, 86, 219, 0.12)',
        'glass-hover': '0 16px 48px rgba(26, 86, 219, 0.22)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        // Claymorphism shadows
        'clay-sm': '6px 6px 10px rgba(174,182,192,0.55), -6px -6px 12px rgba(255,255,255,0.75)',
        'clay-md': '9px 9px 18px rgba(174,182,192,0.5), -9px -9px 18px rgba(255,255,255,0.7)',
        'clay-lg': '14px 14px 28px rgba(174,182,192,0.45), -14px -14px 28px rgba(255,255,255,0.65)',
        'clay-inset': 'inset 5px 5px 10px rgba(174,182,192,0.45), inset -5px -5px 10px rgba(255,255,255,0.75)',
        'clay-pressed': 'inset 6px 6px 12px rgba(174,182,192,0.5), inset -6px -6px 12px rgba(255,255,255,0.7)',
      },
      backgroundImage: {
        'orb-primary': 'radial-gradient(circle, #7C3AED 0%, transparent 70%)',
        'orb-accent': 'radial-gradient(circle, #FDF4FF 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'orb-drift-1': 'drift1 20s ease-in-out infinite',
        'orb-drift-2': 'drift2 18s ease-in-out infinite reverse',
        'orb-drift-3': 'drift3 22s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        drift1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(5%, -5%) scale(1.05)' },
          '66%': { transform: 'translate(-5%, 5%) scale(0.95)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-5%, -5%) scale(0.95)' },
          '66%': { transform: 'translate(5%, 5%) scale(1.05)' },
        },
        drift3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(0, -10%) scale(1.1)' },
        },
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
