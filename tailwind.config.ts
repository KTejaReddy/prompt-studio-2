import type { Config } from "tailwindcss";

/**
 * Promptly design system — "Market" v2.
 * A structural multicolor system: ten color families, each with its own
 * light surface tint, used as real design regions — not decoration.
 * 70% warm-neutral foundation · 20% tinted surfaces · 10% strong accents.
 * Light-only, by design.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cool cyan-white foundation (the 70%)
        paper: {
          DEFAULT: "#F7FDFE", // cyan-tinted white
          soft: "#EFF9FB", // ice
          deep: "#E4F5F8", // pale cyan
        },
        blush: "#EFF9FB",
        ivory: {
          DEFAULT: "#F7FDFE",
          soft: "#EFF9FB",
          deep: "#E4F5F8",
        },
        ink: {
          DEFAULT: "#2B2430",
          soft: "#6B6472",
          mute: "#9A93A1",
          faint: "#CFC8D4",
        },
        // ---- Color families (the 20% surfaces + 10% accents) ----
        // Each: surface (page/card tint) · soft (hover tint) · DEFAULT (accent)
        // · deep (readable text on tints)
        // Brand color — cyan leads the system (§ theme color)
        cyan: {
          surface: "#EBFAFC",
          soft: "#D2F3F8",
          light: "#7DD9E8",
          DEFAULT: "#22B8CD",
          deep: "#0B7285",
        },
        coral: {
          surface: "#FFF0EA",
          soft: "#FFE3DA",
          light: "#FF9B90",
          DEFAULT: "#FF6B5F",
          deep: "#C93A2F",
        },
        pink: {
          surface: "#FFF2F7",
          soft: "#FFDFEC",
          light: "#FF8CC0",
          DEFAULT: "#F45197",
          deep: "#C2276F",
        },
        orange: {
          surface: "#FFF6F1",
          soft: "#FFE8D6",
          light: "#FFB37D",
          DEFAULT: "#FF8A3D",
          deep: "#B85E14",
        },
        gold: {
          surface: "#FFF8DF",
          soft: "#FFEDB8",
          light: "#FFDD8A",
          DEFAULT: "#F6C453",
          deep: "#8A6410",
        },
        mint: {
          surface: "#F2FBF7",
          soft: "#D9F4E8",
          light: "#9BE6CB",
          DEFAULT: "#6FD8B5",
          deep: "#1F7D5F",
        },
        turquoise: {
          surface: "#EAF8F6",
          soft: "#CFEFEB",
          light: "#7DDCD2",
          DEFAULT: "#31C7B5",
          deep: "#0C7A6E",
        },
        sky: {
          surface: "#EEF9FC",
          soft: "#D8F0F9",
          light: "#93D2F0",
          DEFAULT: "#54B8E8",
          deep: "#1B6FA8",
        },
        lavender: {
          surface: "#F4F1FF",
          soft: "#E5DEFE",
          light: "#C9B4FF",
          DEFAULT: "#A98BFF",
          deep: "#6444C8",
        },
        violet: {
          surface: "#F3EFFE",
          soft: "#E3DAFD",
          light: "#B49CFF",
          DEFAULT: "#8F6DEB",
          deep: "#5F3DC4",
        },
        peach: {
          surface: "#FFF6F1",
          soft: "#FFE6D4",
          light: "#FFCBA8",
          DEFAULT: "#FFB48C",
          deep: "#B05E2A",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-archivo)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        body: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "ui-sans-serif", "system-ui", "sans-serif"],
        headline: ["var(--font-bricolage)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "var(--font-spline)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        display: ["3rem", { lineHeight: "1.06", letterSpacing: "-0.025em", fontWeight: "800" }],
        headline: ["1.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "750" }],
      },
      backgroundImage: {
        // Semantic action gradients (no blue/purple AI gradients anywhere)
        "grad-find": "linear-gradient(100deg, #22B8CD 0%, #31C7B5 100%)",
        "grad-generate": "linear-gradient(100deg, #22B8CD 0%, #54B8E8 100%)",
        "grad-explore": "linear-gradient(100deg, #31C7B5 0%, #6FD8B5 100%)",
        "grad-workflow": "linear-gradient(100deg, #8F6DEB 0%, #A98BFF 100%)",
        "grad-cta": "linear-gradient(100deg, #22B8CD 0%, #31C7B5 52%, #6FD8B5 100%)",
        "grad-text": "linear-gradient(95deg, #22B8CD 0%, #31C7B5 55%, #6FD8B5 100%)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(11, 114, 133, 0.04), 0 6px 18px rgba(34, 184, 205, 0.06)",
        lift: "0 2px 6px rgba(11, 114, 133, 0.05), 0 14px 34px rgba(34, 184, 205, 0.10)",
        glow: "0 6px 20px rgba(34, 184, 205, 0.20), 0 3px 10px rgba(49, 199, 181, 0.16)",
        searchGlow:
          "0 2px 6px rgba(34, 184, 205, 0.08), 0 14px 44px rgba(34, 184, 205, 0.12), 0 28px 80px rgba(49, 199, 181, 0.10)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pop: {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "70%": { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        floaty: {
          "0%": { transform: "translateY(0) scale(1)" },
          "100%": { transform: "translateY(-14px) scale(1.04)" },
        },
        "step-pulse": {
          "0%, 100%": { opacity: "0.25", transform: "scale(0.85)" },
          "35%": { opacity: "1", transform: "scale(1.15)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s cubic-bezier(0.21, 0.61, 0.35, 1) both",
        "fade-in": "fade-in 0.3s ease both",
        shimmer: "shimmer 1.4s linear infinite",
        pop: "pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        floaty: "floaty 7s ease-in-out infinite alternate",
        "step-pulse": "step-pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
