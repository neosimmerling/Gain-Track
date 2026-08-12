/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161A',
        surface: '#1D2027',
        surfaceHi: '#262B34',
        chalk: '#EDEDE6',
        muted: '#8A909C',
        plate: '#F2C14E',
        plateDark: '#C99A2E',
        good: '#5FA777',
        bad: '#D9534F'
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      }
    }
  },
  plugins: []
}
