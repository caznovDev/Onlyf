/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rose: {
          500: '#f43f5e',
        },
        slate: {
          950: '#020617',
        }
      },
    },
  },
  plugins: [],
}