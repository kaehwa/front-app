module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#43B0FF",
        muted: "#F4F6F8",
        text: "#1A1A1A",
      },
      borderRadius: { xl: "16px", "2xl": "24px" },
    },
  },
  plugins: [],
}
