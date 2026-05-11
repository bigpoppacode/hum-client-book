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
        primary: {
          50: "#eef8ff",
          100: "#d9efff",
          200: "#bce4ff",
          300: "#8ed4ff",
          400: "#58b8f7",
          500: "#2e9de8",
          600: "#167cc5",
          700: "#14659f",
          800: "#165684",
          900: "#19486d",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      boxShadow: {
        glow: "0 24px 70px -24px rgba(20, 101, 159, 0.45)",
      },
      minHeight: {
        tap: "44px",
        "tap-lg": "56px",
      },
      minWidth: {
        tap: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
