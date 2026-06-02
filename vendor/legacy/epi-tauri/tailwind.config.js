/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        domain: {
          m0: "#8B5CF6",
          m1: "#3B82F6",
          m2: "#10B981",
          m3: "#F59E0B",
          m4: "#EF4444",
          m5: "#EC4899",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
