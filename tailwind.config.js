module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ct-bg': '#070A12',
        'ct-bg-secondary': '#111725',
        'ct-accent': '#00E5C0',
        'ct-text': '#F2F5FA',
        'ct-text-secondary': '#A7B1C6',
        'destructive': '#ff4d4f',
      },
      borderRadius: { xl: '1rem' },
      boxShadow: { dashboard: '0 18px 50px rgba(0,0,0,0.45)' },
    },
  },
};