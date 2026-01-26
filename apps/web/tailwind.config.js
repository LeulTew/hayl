/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'media', // or 'class' if we want manual toggle, let's allow 'class' for manual control or 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'], 
      },
      colors: {
        hayl: {
          bg: 'var(--hayl-bg)',
          surface: 'var(--hayl-surface)',
          text: 'var(--hayl-text)',
          muted: 'var(--hayl-muted)',
          accent: 'var(--hayl-accent)',
          border: 'var(--hayl-border)',
        }
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      transitionDuration: {
        fast: '150ms',
      },
    },
  },
  plugins: [],
}
