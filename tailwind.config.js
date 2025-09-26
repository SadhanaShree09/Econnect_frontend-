/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  container: {
    center: true,
    padding: "1rem",
    screens: {
      sm: "100%",
      md: "100%",
      lg: "1440px",
      xl: "1280px",
    },
  },

  theme: {
    extend: {
      fontFamily: {
        Opensans: ["Open Sans"],
        Bitter: ["Bitter"],
        Merriweather: ["Merriweather"],
        Noticia: ["Noticia"],
        Poppins: ["Poppins"],
        Domine: ["Domine"],
        prompt: ["Prompt"],
      },
      colors: {
        color1: "#76ad5f",
        color2: "#8BB977",
        color3: "#6d9eeb",

      },
    },
  },
  plugins: [],
};


