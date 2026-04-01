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
        ink: "#050807",
        carbon: "#0d1411",
        lime: "#c9ff43",
        ember: "#ff7a1a",
        mist: "#d9efe4"
      },
      boxShadow: {
        glow: "0 0 40px rgba(201, 255, 67, 0.18)"
      },
      backgroundImage: {
        "hero-grid":
          "linear-gradient(to right, rgba(217,239,228,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(217,239,228,0.07) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
