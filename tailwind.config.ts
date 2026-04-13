import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0e1015",
        carbon: "#171a21",
        lime: "#ffdc3d",
        ember: "#ffdc3d",
        mist: "#f4f4f5"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255, 220, 61, 0.35)"
      },
      backgroundImage: {
        "hero-grid":
          "none"
      }
    }
  },
  plugins: []
};

export default config;
