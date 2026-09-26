/**
 * Tailwind CSS Configuration
 * https://tailwindcss.com/docs/configuration
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#6b7280",
        accent: "#f59e0b",
        success: "#10b981",
        danger: "#ef4444"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
