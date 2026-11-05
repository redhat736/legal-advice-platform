/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        legal: {
          navy: '#0B132B',
          midnight: '#1C2541',
          accent: '#3A86FF',
          accentHover: '#2563EB',
          gold: '#C59B27',
          slateBg: '#F8FAFC',
          cardBorder: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
