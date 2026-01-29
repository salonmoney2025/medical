import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gold and Black Theme
        primary: {
          gold: "#FFD700",
          lightGold: "#FFED4E",
          darkGold: "#B8860B",
        },
        secondary: {
          black: "#000000",
          darkGray: "#1A1A1A",
          mediumGray: "#2D2D2D",
          lightGray: "#4A4A4A",
        },
        accent: {
          gold: "#DAA520",
          paleGold: "#F0E68C",
        },
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
