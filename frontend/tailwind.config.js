/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16a34a",
        secondary: "#15803d",
        dark: "#0f172a",
        accent: "#f59e0b",
        danger: "#ef4444",
        surface: "#f8fafc",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 15px -3px rgba(0,0,0,.07), 0 10px 20px -2px rgba(0,0,0,.04)",
        hover: "0 10px 40px -10px rgba(22,163,74,.3)",
      },
      animation: {
        "slide-up": "slideUp .4s ease-out",
        "fade-in": "fadeIn .3s ease-out",
        "bounce-sm": "bounceSm 2s infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        bounceSm: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};
