/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jurassic: {
          leaf: '#166534',
          rock: '#451a03',
          volcano: '#991b1b',
          glow: '#fbbf24',
          sky: '#0f172a'
        }
      },
      fontFamily: {
        game: ['"Press Start 2P"', 'system-ui'],
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
