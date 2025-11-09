/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { 'soft':'0 10px 30px rgba(0,0,0,0.08)', 'glow':'0 0 0 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.25)' },
      borderRadius: { '2xl':'1.25rem' }
    }
  },
  plugins: [],
}