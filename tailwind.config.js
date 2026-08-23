/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.{html,js}'],
  theme: {
    extend: {
      colors: {
        brand: '#1a1410',
        brand2: '#3d2f23',
        ink: '#1a1410',
        muted: '#7c6f5f',
        accent: '#c8962a',
        accdeep: '#9a6f1c',
        paper: '#faf6ef',
        line: '#e7ddcd'
      },
      fontFamily: {
        heading: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
