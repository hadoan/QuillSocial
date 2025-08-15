const plugin = require("tailwindcss/plugin");
const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const subtleColor = "#E5E7EB";
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/app-store/*/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/app-store/*/pages/**/*.{js,ts,jsx,tsx}",
    "../../packages/features/*/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/features/*/lib/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/components/**/*.{js,ts,jsx,tsx}",
    "../../packages/atoms/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emphasis: "var(--quill-bg-emphasis)",
        default: "var(--quill-bg, white)",
        subtle: "var(--quill-bg-subtle)",
        muted: "var(--quill-bg-muted)",
        inverted: "var(--quill-bg-inverted)",
        info: "var(--quill-bg-info)",
        success: "var(--quill-bg-success)",
        attention: "var(--quill-bg-attention)",
        error: "var(--quill-bg-error)",
        darkerror: "var(--quill-bg-dark-error)",
        black: "#111111",
        awst:'#1E88E5',
        awstbgbt: 'rgba(84, 52, 212, 0.10)',
        awsthv:'#1976D2',
        brand: {
          default: "var(--quill-brand,#111827)",
          emphasis: "var(--quill-brand-emphasis,#101010)",
          subtle: "var(--quill-brand-subtle,#9CA3AF)",
          accent: "var(--quill-brand-accent,white)",
        },
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        darkgray: {
          50: "#101010",
          100: "#1c1c1c",
          200: "#2b2b2b",
          300: "#444444",
          400: "#575757",
          500: "#767676",
          600: "#a5a5a5",
          700: "#d6d6d6",
          800: "#e8e8e8",
          900: "#f3f4f6",
        },
      },
      borderColor: {
        emphasis: "var(--quill-border-emphasis, #9CA3AF)",
        default: "var(--quill-border, #D1D5DB)",
        subtle: `var(--quill-border-subtle, ${subtleColor})`,
        muted: "var(--quill-border-muted, #F3F4F6)",
        booker: `var(--quill-border-booker, ${subtleColor})`,
        error: "var(--quill-border-error, #AA2E26)",
        awst:'#1E88E5',
        awsthv:'#1976D2',
      },
      textColor: {
        emphasis: "var(--quillsocial-text-emphasis, #111827)",
        default: "var(--quillsocial-text, #374151)",
        subtle: "var(--quillsocial-text-subtle, #6B7280)",
        muted: "var(--quillsocial-text-muted, #9CA3AF)",
        inverted: "var(--quillsocial-text-inverted, white)",
        info: "var(--quillsocial-text-info, #253985)",
        success: "var(--quillsocial-text-success, #285231)",
        attention: "var(--quillsocial-text-attention, #73321B)",
        error: "var(--quillsocial-text-error, #752522)",
        brand: "var(--quill-brand-text,'white')",
        awst:'#1E88E5',
        awsttt:"#2C4050",
        awstdr:"#808C96",
      },
      fill: {
        emphasis: "var(--quillsocial-text-emphasis, #111827)",
        default: "var(--quillsocial-text, #374151)",
        subtle: "var(--quillsocial-text-subtle, #6B7280)",
        muted: "var(--quillsocial-text-muted, #9CA3AF)",
        inverted: "var(--quillsocial-text-inverted, white)",
        info: "var(--quillsocial-text-info, #253985)",
        success: "var(--quillsocial-text-success, #285231)",
        attention: "var(--quillsocial-text-attention, #73321B)",
        error: "var(--quillsocial-text-error, #752522)",
        brand: "var(--quill-brand-text)",
      },
      screens: {
        pwa: { raw: "(display-mode: standalone)" },
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "none" },
        },
        spinning: {
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 600ms var(--animation-delay, 0ms) cubic-bezier(.21,1.02,.73,1) forwards",
        spinning: "spinning 0.75s linear infinite",
      },
      boxShadow: {
        dropdown: "0px 2px 6px -1px rgba(0, 0, 0, 0.08)",
      },
      borderWidth: {
        "booker-width": "var(--quill-border-booker-width, 1px)",
      },
      fontFamily: {
        quill: ["var(--font-quill)", ...fontFamily.serif],
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["Roboto Mono", "monospace"],
      },
      maxHeight: (theme) => ({
        0: "0",
        97: "25rem",
        ...theme("spacing"),
        full: "100%",
        screen: "100vh",
      }),
      minHeight: (theme) => ({
        0: "0",
        ...theme("spacing"),
        full: "100%",
        screen: "100vh",
      }),
      minWidth: (theme) => ({
        0: "0",
        ...theme("spacing"),
        full: "100%",
        screen: "100vw",
      }),
      maxWidth: (theme, { breakpoints }) => ({
        0: "0",
        ...theme("spacing"),
        ...breakpoints(theme("screens")),
        full: "100%",
        screen: "100vw",
      }),
      backgroundImage: {
        "gradient-primary": "radial-gradient(162.05% 170% at 109.58% 35%, #667593 0%, #E3E3E3 100%)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
    require("tailwindcss-radix")(),
    require("@savvywombat/tailwindcss-grid-areas"),
    plugin(({ addVariant }) => {
      addVariant("mac", ".mac &");
      addVariant("windows", ".windows &");
      addVariant("ios", ".ios &");
    }),
    plugin(({ addBase, theme }) => {
      addBase({
        hr: {
          borderColor: theme("subtle"),
        },
      });
    }),
  ],
  variants: {
    scrollbar: ["rounded", "dark"],
  },
};
