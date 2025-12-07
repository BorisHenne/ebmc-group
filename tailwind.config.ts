import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ebmc: {
          turquoise: '#2DB5B5',
          'turquoise-dark': '#249292',
          black: '#1C1C1C',
        },
      },
    },
  },
  plugins: [],
}

export default config
