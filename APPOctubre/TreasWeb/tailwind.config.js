module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('../TREASWEB/src/assets/FondoAppWeb.jpg')",
      },
      colors: {
        red_treas: '#F20505', // Replace with your color code
        primary: '#f20505',
        secondary: '#f2f2f2',
        dark: '#0d0d0d',
        accent1: '#f24452',
        accent2: '#f27983',
        gray: {
          400: '#404040',
          500: '#a1a3a6',
        },
        light: {
          100: '#fff0f0',
          200: '#ffdddd',
          300: '#ffc1c1',
          400: '#ff9797',
          500: '#ff5b5b',
          600: '#ff2828',
        },
        red: {
          700: '#d30202',
          800: '#ae0606',
          900: '#8f0d0d',
          950: '#4f0000',
        },
      },
    },
  },
  plugins: [],
}
