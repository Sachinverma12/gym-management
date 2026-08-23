/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Serif", "ui-serif", "serif"],
      },
      colors: {
        brand: {
          green: {
            50: "#f0fdf4",
            100: "#dcfce7",
            200: "#a7f3d0",
            300: "#67e8f9",
            400: "#22c55e",
            500: "#16a34a",
            600: "#15803d",
            700: "#166534",
            800: "#14532d",
            900: "#102a1f",
          },
        },
      },
    },
  },
  plugins: [],
};