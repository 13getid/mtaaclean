/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MtaaClean brand palette
        'brand-offwhite':  '#F7F5EE',
        'brand-ink':       '#20211D',
        'brand-green':     '#B8ED70',
        'brand-sage':      '#DCE8D4',
        'brand-orange':    '#F1A078',
        'brand-red':       '#E53935',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'brutal':    '4px 4px 0px #20211D',
        'brutal-lg': '6px 6px 0px #20211D',
        'brutal-sm': '2px 2px 0px #20211D',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
