/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      borderColor: {
        primary: "#B5B2B2",
      },
      colors: {
        primary: "#1A589F",
        gray: {
          50: "#F5F2F2",
        },
      },
    },
  },
  plugins: [],
};
