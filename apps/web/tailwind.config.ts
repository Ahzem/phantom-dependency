import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        phantom: {
          dark: "#08090d",
          surface: "#0f1118",
          card: "#121520",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "#181b29",
          green: "#10b981",    // Resting
          amber: "#f59e0b",    // Aging
          purple: "#a855f7",   // Whispering
          rose: "#f43f5e",     // Haunted
          cyan: "#06b6d4",
          muted: "#94a3b8",
        },
      },
      boxShadow: {
        "ghost": "0 0 25px -5px rgba(168, 85, 247, 0.15)",
        "spectral": "0 0 30px -5px rgba(16, 185, 129, 0.15)",
        "haunted": "0 0 30px -5px rgba(244, 63, 94, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
