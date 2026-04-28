//frontend/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PALETA PREMIUM OMMA GROUP
        omma: {
          dark: "#050A14",       // Casi negro para contrastes profundos
          primary: "#0B162C",    // El azul marino de tu logotipo
          accent: "#1E3A5F",     // Azul intermedio para botones y detalles
          soft: "#F1F5F9",       // Gris azulado muy claro para fondos de burbujas
          bg: "#F8FAFC",         // Fondo general de la aplicación (limpio/médico)
        },
      },
      // Añadimos una sombra suave personalizada para las ventanas de chat
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(11, 22, 44, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;