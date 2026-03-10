/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './renderer/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // M' domain colors
        'm0-graph': '#6366f1',
        'm1-topology': '#8b5cf6',
        'm2-cymascope': '#ec4899',
        'm3-clock': '#f59e0b',
        'm4-journal': '#10b981',
        'm5-system': '#06b6d4',
      },
      zIndex: {
        '15': '15',
        '25': '25',
      },
    },
  },
  plugins: [],
};
