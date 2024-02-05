import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      tablet: "640px",
      md: "960px",
      semilg: "1100px",
    },
    extend: {
      animation: {
        "mouse-wheel": "mouse-wheel 1s infinite alternate",
      },
      keyframes: {
        "mouse-wheel": {
          "0%": {
            transform: "translateY(0)",
          },
          "100%": {
            transform: "translateY(5px)",
          },
        },
      },
      colors: {
        primary: {
          100: "#b0c1bf",
          200: "#9fb3b1",
          300: "#8ea7a6",
          400: "#7e9b9b",
          500: "#6c8e8c",
          600: "#5a817e",
          700: "#496f6d",
          800: "#375e5d",
          900: "#2a4d4e",
        },
        complementary: {
          100: "#e8d7de",
          200: "#d1afc3",
          300: "#bb88a9",
          400: "#a6608e",
          500: "#8e6c7d",
          600: "#76536b",
          700: "#5e3a59",
          800: "#462248",
          900: "#2e0936",
        },
        neutral: {
          light: "#f5f5f5",
          dark: "#333333",
        },
        accent: {
          light: "#c7e0dd",
          dark: "#4a6e6c",
        },
        alert: {
          error: "#d9534f",
          success: "#5cb85c",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};

export default config;
