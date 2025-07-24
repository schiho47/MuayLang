/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('nativewind/preset')],
    content: [
      './App.{js,jsx,ts,tsx}',
      './app/**/*.{js,jsx,ts,tsx}',
      './components/**/*.{js,jsx,ts,tsx}',
      './screens/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'muay-purple': 'rgb(107, 55, 137)',
          'muay-white': '#f9f7fa',
        },
      },
    },
    plugins: [],
  };
  