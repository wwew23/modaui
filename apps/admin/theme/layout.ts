export const layout = {
  sidebar: {
    width: 240,
    widthCollapsed: 64,
    widthPx: "240px",
    widthCollapsedPx: "64px",
  },

  topbar: {
    height: 56,
    heightPx: "56px",
  },

  content: {
    maxWidth: 1440,
    maxWidthPx: "1440px",
    paddingX: 24,
    paddingXPx: "24px",
    paddingY: 24,
    paddingYPx: "24px",
  },

  card: {
    radius: 12,
    radiusPx: "12px",
    padding: 24,
    paddingPx: "24px",
  },

  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1440,
    smPx: "640px",
    mdPx: "768px",
    lgPx: "1024px",
    xlPx: "1280px",
    "2xlPx": "1440px",
  },

  breakpoints: {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
    xsPx: "480px",
    smPx: "640px",
    mdPx: "768px",
    lgPx: "1024px",
    xlPx: "1280px",
    "2xlPx": "1536px",
  },

  zIndex: {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const

export type LayoutConfig = typeof layout
export type SidebarConfig = typeof layout.sidebar
export type TopbarConfig = typeof layout.topbar
export type ContentConfig = typeof layout.content
export type CardConfig = typeof layout.card
export type ContainerConfig = typeof layout.container
export type BreakpointConfig = typeof layout.breakpoints
export type ZIndexConfig = typeof layout.zIndex

export default layout
