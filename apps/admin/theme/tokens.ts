export const tokens = {
  colors: {
    bg: {
      primary: "#FFFFFF",
      secondary: "#F4F6F8",
      tertiary: "#EAECEE",
      muted: "#F9FAFB",
      component: "#FFFFFF",
      componentHover: "#F9FAFB",
      componentPressed: "#F3F4F6",
      field: "#FFFFFF",
      fieldHover: "#F9FAFB",
      highlight: "#F4F6F8",
      highlightHover: "#EAECEE",
      disabled: "#F3F4F6",
      overlay: "rgba(0, 0, 0, 0.10)",
    },

    text: {
      primary: "#111111",
      secondary: "#525252",
      muted: "#71717A",
      disabled: "#A1A1AA",
      onColor: "#FFFFFF",
    },

    border: {
      base: "#E5E7EB",
      strong: "#D1D5DB",
      muted: "#F3F4F6",
      transparent: "transparent",
      interactive: "#D1D5DB",
      error: "#DC2626",
      danger: "#DC2626",
    },

    accent: {
      primary: "#0F172A",
      secondary: "#475569",
      base: "#18181B",
      hover: "#27272A",
      pressed: "#3F3F46",
    },

    button: {
      neutral: "#18181B",
      neutralHover: "#27272A",
      neutralPressed: "#3F3F46",
      inverted: "#FFFFFF",
      invertedHover: "#F3F4F6",
      danger: "#DC2626",
      dangerHover: "#B91C1C",
    },

    semantic: {
      success: "#16A34A",
      warning: "#D97706",
      error: "#DC2626",
      info: "#2563EB",
    },
  },

  spacing: {
    0: "0px",
    0.5: "2px",
    1: "4px",
    1.5: "6px",
    2: "8px",
    2.5: "10px",
    3: "12px",
    3.5: "14px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    9: "36px",
    10: "40px",
    11: "44px",
    12: "48px",
    14: "56px",
    16: "64px",
    20: "80px",
    24: "96px",
    28: "112px",
    32: "128px",
    36: "144px",
    40: "160px",
    44: "176px",
    48: "192px",
    52: "208px",
    56: "224px",
    60: "240px",
    64: "256px",
    72: "288px",
    80: "320px",
    96: "384px",
  },

  radius: {
    none: "0px",
    sm: "2px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px",
    "3xl": "24px",
    full: "9999px",
  },

  shadow: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    cardHover: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    flyout: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    modal: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    tooltip: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },

  transition: {
    duration: {
      fast: "75ms",
      base: "150ms",
      slow: "200ms",
      slower: "300ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },

  typography: {
    fontFamily: {
      sans: [
        "Inter",
        "Geist Sans",
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
      mono: [
        "JetBrains Mono",
        "Geist Mono",
        "SFMono-Regular",
        "Menlo",
        "Monaco",
        "Consolas",
        "monospace",
      ],
    },
    fontSize: {
      xs: { size: "12px", lineHeight: "18px" },
      sm: { size: "14px", lineHeight: "20px" },
      base: { size: "16px", lineHeight: "24px" },
      lg: { size: "18px", lineHeight: "28px" },
      xl: { size: "20px", lineHeight: "28px" },
      "2xl": { size: "24px", lineHeight: "32px" },
      "3xl": { size: "30px", lineHeight: "36px" },
      "4xl": { size: "36px", lineHeight: "40px" },
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    letterSpacing: {
      tighter: "-0.05em",
      tight: "-0.025em",
      normal: "0em",
      wide: "0.025em",
      wider: "0.05em",
      widest: "0.1em",
    },
  },
} as const

export type TokenColors = typeof tokens.colors
export type TokenSpacing = typeof tokens.spacing
export type TokenRadius = typeof tokens.radius
export type TokenShadow = typeof tokens.shadow
export type TokenTransition = typeof tokens.transition
export type TokenTypography = typeof tokens.typography

export default tokens
