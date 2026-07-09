/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#00A99D',
          navy: '#1A2B48',
          sky: '#E3F2FD',
          blue: '#2563EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(26, 43, 72, 0.08)',
        glass: '0 8px 32px rgba(26, 43, 72, 0.06)',
      },
      animation: {
        pulseAlert: 'pulseAlert 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseAlert: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
