/* eslint-env node */
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false,
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      bluegray: colors.blueGray,
      gray: colors.gray,
      indigo: colors.indigo,
      red: colors.red,
      yellow: colors.yellow,
      amber: colors.amber,
      green: colors.emerald,
      blue: colors.blue,
      sky: colors.sky,
      purple: colors.violet,
      orange: colors.orange,
      pink: colors.pink,
      lime: colors.lime,
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
