/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          navy: '#0F172A',
          primary: '#DC2626',
          primaryHover: '#B91C1C',
          secondary: '#64748B',
          accent: '#F97316',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          heading: '#0F172A',
          body: '#475569',
          muted: '#94A3B8',
          border: '#E2E8F0',
          inputBorder: '#CBD5E1',
          navLink: '#334155',
        },
      },
      boxShadow: {
        'card': '0 8px 24px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 16px 32px rgba(15, 23, 42, 0.12)',
        'btn-primary': '0 4px 14px rgba(220, 38, 38, 0.30)',
      },
      borderRadius: {
        'card': '16px',
      },
    },
  },
  plugins: [],
}
