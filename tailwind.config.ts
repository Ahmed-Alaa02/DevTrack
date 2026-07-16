import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Design tokens live in `app/globals.css` as HSL channel triplets so that a
 * future light theme is a matter of swapping CSS variables on `:root` — no
 * component ever hardcodes a hex value.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          raised: "hsl(var(--surface-raised))",
          sunken: "hsl(var(--surface-sunken))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Semantic accent ramp — used by charts, badges and category glyphs.
        success: "hsl(var(--success))",
        info: "hsl(var(--info))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        violet: "hsl(var(--violet))",
        indigo: "hsl(var(--indigo))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // 8px spacing system: every step below is a multiple of 8 (or a half-step).
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        104: "26rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 3px 1px rgb(0 0 0 / 0.15)",
        lift: "0 8px 30px -6px rgb(0 0 0 / 0.5), 0 2px 8px -2px rgb(0 0 0 / 0.3)",
        glow: "0 0 0 1px hsl(var(--primary) / 0.25), 0 8px 32px -8px hsl(var(--primary) / 0.45)",
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(var(--violet)) 0%, hsl(var(--indigo)) 100%)",
        "gradient-mesh":
          "radial-gradient(at 0% 0%, hsl(var(--violet) / 0.14) 0px, transparent 55%), radial-gradient(at 100% 0%, hsl(var(--indigo) / 0.12) 0px, transparent 50%)",
        "gradient-sheen":
          "linear-gradient(180deg, hsl(0 0% 100% / 0.06) 0%, hsl(0 0% 100% / 0) 100%)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite",
      },
    },
  },
  // Imported, not `require()`d: this file uses `import` syntax, so Node loads it
  // as an ES module — where `require` does not exist.
  plugins: [animate],
};

export default config;
