/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", //This means "scan all .js/.jsx files in src/ folder for Tailwind classes" (Tailwind only includes CSS for classes you actually use.)
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}