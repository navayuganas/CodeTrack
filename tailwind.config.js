/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#758097",
        brand: "#6458e8",
        canvas: "#f7f8fc",
        line: "#e9ebf2"
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 4px 18px rgba(31, 39, 71, .045)" }
    }
  },
  plugins: []
};
