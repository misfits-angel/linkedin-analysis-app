/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Unstoppable Brand Colors
        brand: '#307254',
        'brand-secondary': '#2F8F5B',
        'brand-light': '#D6E3DD',
        'brand-beige': '#F6F5F1',
        ink: '#000000',
        secondary: '#6B6B6B',
        disabled: '#CACACA',
        // Legacy colors for compatibility
        brand2: '#2F8F5B',
        muted: '#D6E3DD',
      },
    },
  },
  plugins: [],
}
