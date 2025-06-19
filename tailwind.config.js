/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}', // Configure paths to all your template files
    './public/index.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: { // Required for Taro
    preflight: false,
  }
}
