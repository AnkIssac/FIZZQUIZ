/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6C4EF2',
        accent: '#F2A84E',
        success: '#4ECF7A',
        danger: '#F25E5E',
        bg: '#0F0F1A',
        card: '#1A1A2E',
        'text-secondary': '#A0A0C0',
      },
      fontFamily: {
        display: ['"Fredoka One"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        pop: '0 6px 0 0 rgba(0,0,0,0.35)',
        'pop-sm': '0 4px 0 0 rgba(0,0,0,0.35)',
        glow: '0 0 24px rgba(108,78,242,0.45)',
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%,60%': { transform: 'translateX(-8px)' },
          '40%,80%': { transform: 'translateX(8px)' },
        },
        floatUp: {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.9)' },
          '20%': { opacity: '1', transform: 'translateY(-4px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-56px) scale(1)' },
        },
        fizz: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(78,207,122,0.6)' },
          '50%': { boxShadow: '0 0 28px 6px rgba(78,207,122,0.7)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        shake: 'shake 0.45s ease-in-out',
        floatUp: 'floatUp 1.2s ease-out forwards',
        fizz: 'fizz 1.8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 1.2s ease-in-out',
        gradientShift: 'gradientShift 14s ease infinite',
      },
    },
  },
  plugins: [],
};
