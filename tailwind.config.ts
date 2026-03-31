// tailwind.config.ts
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
        "ct-bg": "#070A12",
        "ct-bg-secondary": "#111725",
        "ct-accent": "#00E5C0",
        "ct-text": "#F2F5FA",
        "ct-text-secondary": "#A7B1C6",
      },
      fontFamily: {
        sora: ["var(--font-sora)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 229, 192, 0.2)",
        dashboard: "0 18px 50px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
