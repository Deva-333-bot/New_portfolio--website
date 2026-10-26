import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7857FF", // Primary Accent
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        navy: {
          900: "#050816", // Main dark bg
          800: "#080D20", // Secondary dark bg
          700: "#0B1226", // Card dark bg
          600: "#252B43", // Fine border
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-purple": "0 0 50px -10px rgba(120, 87, 255, 0.4)",
        "card-subtle": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      }
    },
  },
  plugins: [],
};
export default config;
