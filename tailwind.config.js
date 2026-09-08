/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: 'var(--navy)',
        'navy-dk': 'var(--navy-dk)',
        'navy-lt': 'var(--navy-lt)',
        ink: 'var(--ink)',
        ink2: 'var(--ink2)',
        ink3: 'var(--ink3)',
        bg: 'var(--bg)',
        paper: 'var(--paper)',
        // Renamed from 'border' to 'bb' to avoid collision with Tailwind's border-width utility
        bb: 'var(--border)',
        bb2: 'var(--border2)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        gold: 'var(--gold)',
        'gold-bg': 'var(--gold-bg)',
        // 'red' kept — Tailwind has no built-in 'red' at top level in v3+
        red: 'var(--red)',
        'red-bg': 'var(--red-bg)',
        green: 'var(--green)',
        'row-alt': 'var(--row-alt)',
      },
      fontFamily: {
        body: ['var(--f-body)', 'sans-serif'],
        mono: ['var(--f-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
