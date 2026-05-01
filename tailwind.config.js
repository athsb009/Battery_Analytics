/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        teal: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',
          600: '#0F6E56',
          800: '#085041',
          900: '#04342C',
        },
        coral: {
          50:  '#FAECE7',
          100: '#F5C4B3',
          200: '#F0997B',
          400: '#D85A30',
          600: '#993C1D',
          800: '#712B13',
          900: '#4A1B0C',
        },
        blue: {
          50:  '#E6F1FB',
          100: '#B5D4F4',
          200: '#85B7EB',
          400: '#378ADD',
          600: '#185FA5',
          800: '#0C447C',
          900: '#042C53',
        },
        amber: {
          50:  '#FAEEDA',
          100: '#FAC775',
          200: '#EF9F27',
          400: '#BA7517',
          600: '#854F0B',
          800: '#633806',
          900: '#412402',
        },
        ink: {
          50:  '#F1EFE8',
          100: '#D3D1C7',
          200: '#B4B2A9',
          400: '#888780',
          600: '#5F5E5A',
          800: '#444441',
          900: '#2C2C2A',
        },
      },
    },
  },
  plugins: [],
}
