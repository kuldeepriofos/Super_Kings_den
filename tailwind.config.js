/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        csk: {
          yellow: '#FFCB05', // Official CSK Website & Jersey Yellow
          gold: '#FFCB05',
          lightYellow: '#FFF4BF',
          blue: '#0066B3', // Official CSK Brand Blue
          royalBlue: '#034EA2', // Official CSK Royal Deep Blue
          orange: '#F37021', // Official CSK Lion Mane Orange
          navy: '#00275B', // Official CSK Navy
          darkNavy: '#081432', // Official CSK Deep Midnight Background
          cardNavy: '#0D1E47',
          borderNavy: '#1A3670',
          offWhite: '#F6F8FA',
        },
        jsk: {
          yellow: '#FFD100',
          green: '#007A3D',
          dark: '#052614',
        },
        tsk: {
          blue: '#00205B',
          red: '#C8102E',
          gold: '#FFCB05',
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Outfit'", 'sans-serif'],
        display: ["'Outfit'", "'Plus Jakarta Sans'", 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '600',
        extrabold: '600',
        black: '600', // Capped at max 600 across entire site
      },
      boxShadow: {
        'csk-glow': '0 0 25px -5px rgba(255, 203, 5, 0.4)',
        'blue-glow': '0 0 25px -5px rgba(0, 102, 179, 0.4)',
      }

    },
  },
  plugins: [],
}
