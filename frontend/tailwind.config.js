/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-black': '#0f1818',      // Deep Navy
        'vibrant-orange': '#fa7921', // Vibrant Orange
        'crimson-red': '#6c0e23',    // Crimson Red
        'mint-green': '#85ffc7',     // Mint Green
        'soft-white': '#f7f7ff',     // Soft White
      },
    },
  },
  plugins: [],
}