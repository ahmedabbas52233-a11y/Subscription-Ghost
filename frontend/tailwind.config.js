/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 400:"#818cf8", 500:"#6366f1", 600:"#4f46e5" },
        accent:  { 500:"#a855f7", 600:"#7c3aed" },
        surface: { 50:"#f8fafc", 900:"#0c0c10", 800:"#12121a", 700:"#1a1a24" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
