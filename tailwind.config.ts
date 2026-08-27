import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#FFB84D',
        background: '#FDF8F0',
        foreground: '#29150B',
        muted: '#6B7280',
        accent: '#FFB84D',
        success: '#10B981',
        error: '#EF4444',
        border: '#D1D5DB',
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
