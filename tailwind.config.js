// tailwind.config.js
module.exports = {
  content: [
    './app.vue',
    './pages/**/*.{vue,js}',
    './components/**/*.{vue,js}',
    './layouts/**/*.{vue,js}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-mono': ['"Space Mono"', 'monospace']
      }
    },
  },
  plugins: [],
}
