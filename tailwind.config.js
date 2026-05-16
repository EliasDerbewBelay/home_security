/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}", "./src/screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00E5FF", // Electric Blue
          dark: "#00B8D4",
        },
        secondary: {
          DEFAULT: "#00E676", // Neon Green
          dark: "#00C853",
        },
        danger: {
          DEFAULT: "#FF1744", // Red Alarm
          dark: "#D50000",
        },
        background: {
          DEFAULT: "#0F172A", // Deep Navy
          card: "rgba(30, 41, 59, 0.7)",
        },
        accent: "#7C4DFF", // Purple accent
      },
    },
  },
  plugins: [],
};
