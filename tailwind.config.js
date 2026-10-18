/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gobrown: {
          50: '#fdf8f0',
          100: '#f7eddc',
          200: '#edd8b7',
          300: '#e0bd8c',
          400: '#d19e62',
          500: '#c58444',
          600: '#b06c37',
          700: '#925230',
          800: '#77422b',
          900: '#623826',
        },
      },
      fontFamily: {
        cartoon: ['"Comic Sans MS"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
