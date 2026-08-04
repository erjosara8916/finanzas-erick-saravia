/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,astro}",
  ],
  darkMode: 'class', // Usar clase 'dark' en lugar de prefers-color-scheme
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}







