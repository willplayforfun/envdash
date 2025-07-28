module.exports = {
  plugins: { // React Scripts (your build tool) automatically uses PostCSS, so this file tells it what plugins to use.
    tailwindcss: {}, // Run Tailwind first
    autoprefixer: {}, // Then add vendor prefixes
  },
}