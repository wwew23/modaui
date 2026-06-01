export const designTokens = {
  colors: {
    surface: "bg-background",
    surfaceMuted: "bg-muted/20",
    surfaceCard: "bg-card",
    border: "border border-border",
    text: "text-foreground",
    textMuted: "text-muted-foreground",
    primary: "bg-foreground text-background",
    accent: "bg-blue-500"
  },
  spacing: {
    xs: "p-2",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-12",
    section: "py-16 px-6"
  },
  radius: {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl"
  },
  typography: {
    h1: "text-4xl md:text-5xl lg:text-6xl font-bold",
    h2: "text-2xl md:text-3xl font-bold",
    h3: "text-xl font-semibold",
    body: "text-base",
    bodyLarge: "text-lg md:text-xl"
  },
  layout: {
    container: "max-w-7xl mx-auto",
    grid2: "grid grid-cols-1 md:grid-cols-2 gap-6",
    grid3: "grid grid-cols-1 md:grid-cols-3 gap-6",
    grid4: "grid grid-cols-1 md:grid-cols-4 gap-6"
  }
} as const
