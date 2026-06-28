/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Boogie core palette
        'boogie-black':    '#080808',
        'boogie-charcoal': '#111111',
        'boogie-surface':  '#1a1a1a',
        'boogie-white':    '#f0f0f0',
        // Neon concert accents
        'boogie-neon':     '#39ff14',   // electric green
        'boogie-cyan':     '#00eaff',   // stage cyan
        'boogie-purple':   '#bf00ff',   // concert purple
        'boogie-amber':    '#ffb300',   // warm spotlight
        // Legacy compat
        'boogie-red':      '#dc143c',
        'boogie-dark-red': '#a01030',
        'boogie-gold':     '#d4af37',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body':    ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-glow':  'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fade-in 0.5s ease-out',
        'slide-up':    'slide-up 0.5s ease-out',
        'neon-flicker':'neon-flicker 3s ease-in-out infinite',
        'marquee':     'marquee 24s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.6' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '92%':      { opacity: '1' },
          '93%':      { opacity: '0.4' },
          '94%':      { opacity: '1' },
          '96%':      { opacity: '0.6' },
          '98%':      { opacity: '1' },
        },
        'marquee': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'neon-green':  '0 0 20px rgba(57,255,20,0.4), 0 0 60px rgba(57,255,20,0.15)',
        'neon-cyan':   '0 0 20px rgba(0,234,255,0.4), 0 0 60px rgba(0,234,255,0.15)',
        'neon-purple': '0 0 20px rgba(191,0,255,0.4), 0 0 60px rgba(191,0,255,0.15)',
        'neon-amber':  '0 0 20px rgba(255,179,0,0.4),  0 0 60px rgba(255,179,0,0.15)',
      },
    },
  },
  plugins: [],
}