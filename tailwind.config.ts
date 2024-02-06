import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      listStyleType: {
        none: "none",
        disc: "disc",
        decimal: "decimal",
        square: "square",
        roman: "upper-roman",
      },
      keyframes: {
        loginBanner: {
          "0%": { transform: "translateX(245px)" },
          "50%": { transform: "translateX(245px)" },
          "100%": { transform: "translateY(0)" },
        },
        login: {
          "0%": { transform: "translateX(-245px)", opacity: "0" },
          "50%": { transform: "translateX(-245px)", opacity: "0" },
          "75%": { opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        loginBanner: "loginBanner 2s ease-in-out",
        login: "login 2s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
