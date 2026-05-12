/**
 * Tailwind CSS v4 configuration reference.
 *
 * NOTE: Tailwind CSS v4 uses CSS-first configuration via @theme directives
 * in src/app/globals.css instead of this file. This file is kept for
 * documentation and tooling compatibility.
 *
 * Color palette:
 *   Primary   — Indigo/Blue  (indigo-600 / blue-600)  → --color-primary-*
 *   Secondary — Slate        (slate-600)               → --color-secondary-*
 *   Accent    — Emerald      (emerald-500)             → --color-accent-*
 *   Error     — Red          (red-500)                 → --color-error-*
 *
 * Usage examples (Tailwind utility classes still work as normal):
 *   bg-indigo-600   text-slate-600   bg-emerald-500   text-red-500
 *   bg-primary-600  text-secondary-600  bg-accent-500  text-error-500
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/hooks/**/*.{js,jsx,ts,tsx}',
    './src/context/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Indigo/Blue
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5', // indigo-600
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Secondary — Slate
        secondary: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569', // slate-600
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Accent — Emerald
        accent: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // emerald-500
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Error — Red
        error: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // red-500
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
    },
  },
  plugins: [],
};
