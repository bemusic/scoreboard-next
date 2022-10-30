/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cardinal: {
          100: '#fee3ed',
          200: '#e9a8bb',
          300: '#de809a',
          400: '#e34e7a',
          500: '#b61a44',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
