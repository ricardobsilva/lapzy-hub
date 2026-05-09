import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:           "#0A0A0A",
        surface:      "#141414",
        "surface-2":  "#1C1C1C",
        green:        "#00E676",  // ações primárias, delta positivo, PR
        purple:       "#BF5AF2",  // melhor volta — usar com parcimônia
        red:          "#FF3B30",  // ações destrutivas, delta negativo
        brand:        "#FF6D00",  // logo apenas — NUNCA em UI
        s1:           "#00B0FF",
        s2:           "#FFD600",
        s3:           "#FF6D00",
        "text-primary":   "rgba(255,255,255,1.0)",
        "text-secondary": "rgba(255,255,255,0.5)",
        "text-muted":     "rgba(255,255,255,0.3)",
      },
      fontFamily: {
        display: ["Rajdhani", "monospace"],  // tempos, números, headings
        body:    ["Inter", "sans-serif"],     // texto geral, labels
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
    },
  },
  plugins: [],
}

export default config
