/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@openhands/ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#c9b974",
        logo: "#cfb755",
        base: "#0d0f11",
        "base-secondary": "#24272e",
        danger: "#e76a5e",
        success: "#a5e75e",
        basic: "#9099ac",
        tertiary: "#454545",
        "tertiary-light": "#b7bdc2",
        content: "#ecedee",
        "content-2": "#f9fbfe",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
}
