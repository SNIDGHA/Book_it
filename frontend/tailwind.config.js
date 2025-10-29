/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#f7c948",
          dark: "#1f2937"
        }
      }
    }
  },
  plugins: []
};


